import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  imports: [],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TopBar {
  private readonly _router = inject(Router);
  private readonly _location = inject(Location);

  /** Owner-approved functional chrome: home button returns to the grid. */
  goHome() {
    this._router.navigate(['/']);
  }

  // * Router-driven visit history (no-op at bounds; can't be grayed out)
  back() {
    this._location.back();
  }

  forward() {
    this._location.forward();
  }
}
