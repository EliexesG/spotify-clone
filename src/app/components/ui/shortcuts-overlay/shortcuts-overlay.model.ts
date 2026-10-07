/** One row of the shortcuts overlay: action name plus its keycaps */
export interface ShortcutEntry {
  /** Human-readable action name */
  description: string;
  /** Keycaps to display (official presentation order) */
  keys: string[];
}

/** A titled group of shortcut rows (the official modal groups by concern) */
export interface ShortcutGroup {
  /** Section heading */
  heading: string;
  /** Rows within the section */
  entries: ShortcutEntry[];
}
