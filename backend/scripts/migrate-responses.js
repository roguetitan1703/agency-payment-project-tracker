/*
Simple migration script that performs conservative replacements to use
`src/utils/response` helpers where patterns are straightforward.

It replaces common occurrences such as:
 - `res.json({ success: true, data: X })` => `response.ok(res, X)`
 - `res.status(201).json({ success: true, data: X })` => `response.created(res, X)`
 - `res.status(400).json({ success: false, error: { code: "CODE", message: "MSG" } })` => `response.error(res, 400, "CODE", "MSG")`

This is intentionally conservative and will not attempt to fully parse
arbitrary JS expressions. Review diffs after running.
*/

const fs = require("fs");
const path = require("path");

const controllersDir = path.join(__dirname, "..", "src", "controllers");
const files = fs.readdirSync(controllersDir).filter((f) => f.endsWith(".ts"));

function ensureImport(content) {
  // ensure `import response from "../utils/response";` exists
  if (/from\s+"\.\.\/utils\/response"/.test(content)) return content;
  // place import after other imports (after first block of imports)
  const lines = content.split("\n");
  let insertAt = 0;
  for (let i = 0; i < Math.min(lines.length, 80); i++) {
    if (!lines[i].startsWith("import ")) {
      insertAt = i;
      break;
    }
    insertAt = i + 1;
  }
  lines.splice(insertAt, 0, 'import response from "../utils/response";');
  return lines.join("\n");
}

function migrateContent(content) {
  let out = content;

  // 1) res.status(201).json({ success: true, data: X }) => return response.created(res, X);
  out = out.replace(
    /return\s+res\.status\(201\)\.json\(\{\s*success:\s*true,\s*data:\s*([\s\S]*?)\}\s*\)\s*;/g,
    (m, p1) => `return response.created(res, ${p1});`
  );

  // 2) res.status(201).json({ success: true, data: X }) without return
  out = out.replace(
    /res\.status\(201\)\.json\(\{\s*success:\s*true,\s*data:\s*([\s\S]*?)\}\s*\)\s*;/g,
    (m, p1) => `response.created(res, ${p1});`
  );

  // 3) res.json({ success: true, data: X }) => return response.ok(res, X);
  out = out.replace(
    /return\s+res\.json\(\{\s*success:\s*true,\s*data:\s*([\s\S]*?)\}\s*\)\s*;/g,
    (m, p1) => `return response.ok(res, ${p1});`
  );
  out = out.replace(
    /res\.json\(\{\s*success:\s*true,\s*data:\s*([\s\S]*?)\}\s*\)\s*;/g,
    (m, p1) => `response.ok(res, ${p1});`
  );

  // 4) res.status(N).json({ success: false, error: { code: "C", message: "M" } }) => response.error(res,N,"C","M")
  // Conservative: only when code and message are simple string literals or simple identifiers
  out = out.replace(
    /return\s+res\.status\((\d{3})\)\.json\(\{\s*success:\s*false,\s*error:\s*\{\s*code:\s*(["'`][^"'`]+["'`])\s*,\s*message:\s*(["'`][^"'`]+["'`])(?:\s*,\s*details:\s*([\s\S]*?))?\s*\}\s*\}\s*\)\s*;/g,
    (m, status, code, message, details) => {
      const detailsArg = details ? `, ${details.trim()}` : "";
      return `return response.error(res, ${status}, ${code}, ${message}${detailsArg});`;
    }
  );

  out = out.replace(
    /res\.status\((\d{3})\)\.json\(\{\s*success:\s*false,\s*error:\s*\{\s*code:\s*(["'`][^"'`]+["'`])\s*,\s*message:\s*(["'`][^"'`]+["'`])(?:\s*,\s*details:\s*([\s\S]*?))?\s*\}\s*\}\s*\)\s*;/g,
    (m, status, code, message, details) => {
      const detailsArg = details ? `, ${details.trim()}` : "";
      return `response.error(res, ${status}, ${code}, ${message}${detailsArg});`;
    }
  );

  // 5) res.status(400).json({ success: false, message: '...' }) -> response.error(res, 400, 'ERROR', '...') conservative
  out = out.replace(
    /return\s+res\.status\((\d{3})\)\.json\(\{\s*success:\s*false,\s*message:\s*(["'`][^"'`]+["'`])\s*\}\s*\)\s*;/g,
    (m, status, message) =>
      `return response.error(res, ${status}, "ERROR", ${message});`
  );

  out = out.replace(
    /res\.status\((\d{3})\)\.json\(\{\s*success:\s*false,\s*message:\s*(["'`][^"'`]+["'`])\s*\}\s*\)\s*;/g,
    (m, status, message) =>
      `response.error(res, ${status}, "ERROR", ${message});`
  );

  // 6) res.status(400).json({ success:false, error: { ... } }) with complex error -> leave for manual review (no change)

  return out;
}

for (const f of files) {
  const full = path.join(controllersDir, f);
  let content = fs.readFileSync(full, "utf8");
  const before = content;
  content = migrateContent(content);
  if (content !== before) {
    content = ensureImport(content);
    fs.writeFileSync(full, content, "utf8");
    console.log("Migrated:", f);
  } else {
    console.log("No change:", f);
  }
}

console.log("Migration complete. Review changes and run tests.");
