export function getClockInTimeZone(
  date: Date,
  timeZone: string,
): { h: number; m: number; dateKey: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return {
    h: Number(map.hour ?? "0"),
    m: Number(map.minute ?? "0"),
    dateKey: `${map.year ?? "0000"}-${map.month ?? "01"}-${map.day ?? "01"}`,
  };
}
