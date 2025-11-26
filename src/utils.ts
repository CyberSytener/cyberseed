export function cn(
  ...classes: Array<string | number | boolean | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}
