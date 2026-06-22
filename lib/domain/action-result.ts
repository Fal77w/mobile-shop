export type ActionResult = { success: true; id?: string } | { error: string };

export function isActionError(
  result: ActionResult | void | undefined
): result is { error: string } {
  return Boolean(result && "error" in result && result.error);
}
