import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Scaffold } from './components/layout/scaffold/scaffold';
import { Title } from '@angular/platform-browser';

/**
 * Root application component: sets the document title and renders the
 * Scaffold shell (routed views live inside it).
 */
@Component({
  selector: 'app-root',
  imports: [Scaffold],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = inject(Title);

  constructor() {
    this.title.setTitle('Spotify Clone');
  }
}
