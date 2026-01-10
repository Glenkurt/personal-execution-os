import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root application component.
 * Serves as the main container for the application.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: [],
})
export class AppComponent {}
