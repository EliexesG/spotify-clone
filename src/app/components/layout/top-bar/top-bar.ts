import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { KeyboardShortcuts } from '../../../services/keyboard-shortcuts';

/**
 * Global top bar. Visual-only chrome per the project scope — except the
 * owner-approved navigation cluster (home button → `/`, chevrons → visit
 * history via `Location`) and the keyboard-shortcuts "?" trigger that
 * opens the shortcuts overlay.
 */
@Component({
  selector: 'app-top-bar',
  imports: [],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TopBar {
  // * Services
  /** Angular Router (home navigation) */
  private readonly _router = inject(Router);
  /** Browser history accessor (back/forward walk) */
  private readonly _location = inject(Location);
  /** Shortcuts overlay trigger (public open signal) */
  protected readonly keyboardShortcuts = inject(KeyboardShortcuts);

  /**
   * Navigates home (official): the house button returns to the grid route.
   *
   * @returns void
   */
  goHome(): void {
    this._router.navigate(['/']);
  }

  /**
   * Goes one step back in the visit history.
   *
   * Silent no-op when there is no previous entry (Location exposes no
   * public way to check bounds, so the button can't be grayed out).
   *
   * @returns void
   */
  back(): void {
    this._location.back();
  }

  /**
   * Goes one step forward in the visit history.
   *
   * Silent no-op when there is no next entry (Location exposes no
   * public way to check bounds, so the button can't be grayed out).
   *
   * @returns void
   */
  forward(): void {
    this._location.forward();
  }
}
