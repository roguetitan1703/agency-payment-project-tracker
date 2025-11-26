import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import response from "../utils/response";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

import tokenBlacklist from "../services/tokenBlacklist";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return response.error(
        res,
        400,
        "VALIDATION_ERROR",
        "Name, email and password are required"
      );
    }

    const existing = await User.findOne({ email });
    if (existing)
      return response.error(res, 409, "CONFLICT", "Email already in use");

    const user = new User({ name, email, password }) as IUser;
    await user.save();

    // Issue both short-lived access token and long-lived refresh token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, type: "access" },
      JWT_SECRET as jwt.Secret,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, type: "refresh" },
      JWT_SECRET as jwt.Secret,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );

    return response.created(res, {
      // Backwards-compatible token field (access token)
      token: accessToken,
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error", err);
    return response.serverError(res, "Internal server error", err);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return response.error(
        res,
        400,
        "VALIDATION_ERROR",
        "Email and password required"
      );

    const user = await User.findOne({ email });
    if (!user)
      return response.unauthorized(res, undefined, "Invalid credentials");

    const valid = await user.comparePassword(password);
    if (!valid)
      return response.unauthorized(res, undefined, "Invalid credentials");

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, type: "access" },
      JWT_SECRET as jwt.Secret,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, type: "refresh" },
      JWT_SECRET as jwt.Secret,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );

    return response.ok(res, {
      token: accessToken,
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error", err);
    return response.serverError(res, "Internal server error", err);
  }
};

export const logout = async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  // Blacklist access token (if provided) and refresh token (if provided in body)
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.split(" ")[1];
    if (token) await tokenBlacklist.add(token);
  }
  const { refreshToken } = req.body || {};
  if (refreshToken) {
    await tokenBlacklist.add(refreshToken);
  }
  return response.ok(res, { message: "Logged out" });
};

export const refresh = async (req: Request, res: Response) => {
  // Refresh should be called with a refresh token (in Authorization header or body)
  const auth = req.headers.authorization;
  const provided =
    auth && auth.startsWith("Bearer ")
      ? auth.split(" ")[1]
      : req.body && req.body.refreshToken;
  if (!provided)
    return response.error(
      res,
      400,
      "VALIDATION_ERROR",
      "No refresh token provided"
    );

  const refreshToken = provided as string;
  try {
    // Reject if token was revoked
    if (await tokenBlacklist.has(refreshToken)) {
      return response.unauthorized(res, undefined, "Refresh token revoked");
    }

    const payload: any = jwt.verify(refreshToken, JWT_SECRET as jwt.Secret);
    // Accept both refresh tokens and (for backward compatibility) access tokens
    // If a refresh token is used we rotate it (blacklist the old one). If an
    // access token is supplied as legacy behavior, issue a new pair but do not
    // attempt to blacklist the access token here.
    const user = await User.findById(payload.id);
    if (!user) return response.notFound(res, "User not found");
    // If a true refresh token was presented, blacklist it to force rotation.
    if (payload.type === "refresh") {
      await tokenBlacklist.add(refreshToken);
    }

    // Issue new pair
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, type: "access" },
      JWT_SECRET as jwt.Secret,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );
    const newRefreshToken = jwt.sign(
      { id: user._id, email: user.email, type: "refresh" },
      JWT_SECRET as jwt.Secret,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );
    return response.ok(res, {
      token: accessToken,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return response.error(res, 400, "ERROR", "Invalid token");
  }
};

export default { register, login, logout, refresh };
