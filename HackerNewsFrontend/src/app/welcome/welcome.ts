import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class WelcomeComponent {
  title = 'Welcome to My Sample App!';
  description = 'This is a simple Angular application to demonstrate basic concepts.';

  private readonly authService = inject(AuthService);

  // Convert observables to signals for cleaner templates and better performance
  protected readonly isAuthenticated = toSignal(this.authService.isAuthenticated$, { initialValue: false });
  protected readonly isAuthEnabled = this.authService.isEnabled;
}
