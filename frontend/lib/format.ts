const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR"
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0
});

const wholePercentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric"
});

export function formatCurrency(value: string | number): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Unavailable";
  }

  return currencyFormatter.format(numericValue);
}

export function formatPercent(value: string | number): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Unavailable";
  }

  return `${percentFormatter.format(numericValue)}%`;
}

export function formatProgressPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${wholePercentFormatter.format(value)}%`;
}

export function formatSignedCurrency(value: string | number): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Unavailable";
  }

  if (numericValue === 0) {
    return formatCurrency(0);
  }

  return `${numericValue > 0 ? "+" : "-"}${formatCurrency(
    Math.abs(numericValue)
  )}`;
}

export function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return dateFormatter.format(date);
}
