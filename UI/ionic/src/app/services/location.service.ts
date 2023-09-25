import { Injectable, Signal, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private router: Router,
    stateService: StateService
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log(`NavigationEnd: ${event.url}`);
      } else if (event instanceof NavigationStart) {
        if (event.restoredState) {
          // back navigation
        }
      }
    })
  }

  goTo(
    url: string
  ): void {
    this.router.navigate([url])
  }

}
