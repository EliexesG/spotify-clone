import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Global top bar. Visual-only chrome per the project scope — except the
 * owner-approved navigation cluster: the home button drives the Router to
 * `/` and the chevrons walk the visit history via `Location`.
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
