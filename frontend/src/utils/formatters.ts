export const currency = (value: number, currencySymbol = "$") => {
  if (isNaN(value)) return `${currencySymbol}0.00`;
  return `${currencySymbol}${value
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export const shortDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString();
};

export const isoNow = () => new Date().toISOString();
