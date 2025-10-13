import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome';
import { NewsComponent } from './news/news';
import { Profile } from './profile/profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent
  },
  {
    path: 'news',
    component: NewsComponent
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  }
];
