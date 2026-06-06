const ENTRY_FLAG = 'msp:show-entry-logo';

export function markEntryAnimationPending(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ENTRY_FLAG, '1');
}

export function consumeEntryAnimation(): boolean {
  if (typeof window === 'undefined') return false;
  const pending = sessionStorage.getItem(ENTRY_FLAG) === '1';
  if (pending) sessionStorage.removeItem(ENTRY_FLAG);
  return pending;
}
