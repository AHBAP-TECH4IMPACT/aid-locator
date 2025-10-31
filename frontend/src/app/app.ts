import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('aid-locator-frontend');
  
  healthResult: any = null;
  healthError: string = '';
  isLoading: boolean = false;
  activeFilters: any[] = [];

  checkHealth() {
    console.log('Health check requested');
  }
}
