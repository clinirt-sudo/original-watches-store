export const formatCentsUSD = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const cn = (...classes: (string | false | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');
