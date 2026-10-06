import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-playlist-view',
  templateUrl: './playlist-view.html',
  styleUrl: './playlist-view.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class PlaylistView {
  id = input<string>();
}
