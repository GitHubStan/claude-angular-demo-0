import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome';
import { NewsComponent } from './news/news';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent
  },
  {
    path: 'news',
    component: NewsComponent
  }
];
