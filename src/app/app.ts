import { Component, inject } from '@angular/core';
import { Scaffold } from './screens/scaffold/scaffold';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [Scaffold],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = inject(Title);

  constructor() {
    this.title.setTitle('Spotify Clone');
  }
}
