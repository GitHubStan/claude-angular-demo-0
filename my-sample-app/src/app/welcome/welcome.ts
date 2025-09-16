import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class WelcomeComponent {
  title = 'Welcome to My Sample App!';
  description = 'This is a simple Angular application to demonstrate basic concepts.';
}
