import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-user-interface',
  templateUrl: './user-interface.page.html',
  styleUrls: ['./user-interface.page.scss'],
})
export class UserInterfacePage implements OnInit {

  constructor(
    private locationService: LocationService
  ) { }

  ngOnInit() {
  }

  handleTurbaseLogoClick() {
    this.locationService.goTo("/tabs/applications")
  }

}
