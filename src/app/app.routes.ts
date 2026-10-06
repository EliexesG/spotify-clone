import { Routes } from '@angular/router';
import { HomeView } from './screens/home-view/home-view';
import { PlaylistView } from './screens/playlist-view/playlist-view';

export const routes: Routes = [
  {
    path: '',
    component: HomeView,
    title: 'Spotify Clone',
  },
  {
    path: 'playlist/:id',
    component: PlaylistView,
    title: 'Spotify Clone',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
