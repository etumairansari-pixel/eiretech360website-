/** Reveal when scrolling up; hide when scrolling down. */
export function headerVisibleAfterScroll(previousY: number, currentY: number, visible: boolean) {
  if (currentY <= 12) return true;
  if (Math.abs(currentY - previousY) < 6) return visible;
  return currentY < previousY;
}
