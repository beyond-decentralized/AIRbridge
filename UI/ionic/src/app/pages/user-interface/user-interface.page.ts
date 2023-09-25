import { Component, OnInit } from '@angular/core';
import { StateService } from '../../services/state.service';
import { combineLatest, take } from 'rxjs';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-user-interface',
  templateUrl: './user-interface.page.html',
  styleUrls: ['./user-interface.page.scss'],
})
export class UserInterfacePage implements OnInit {

  constructor(
    private locationService: LocationService,
    private stateService: StateService
  ) { }

  ngOnInit() {
  }

  navigateInApp(): void {
    combineLatest([
      this.stateService.currentUiUrl$,
      this.stateService.isLoggedIn$
    ]).pipe(
      take(1)
    ).subscribe(([
      currentUiUrl,
      isLoggedIn
    ]) => {
      if (!isLoggedIn) {
        return
      }
      let iframe = this.stateService.iframe
      const uiIFrameWrapper = document.getElementById('ui-iframe-wrapper')
      const iframeExists = !!iframe
      if (!iframeExists) {
        iframe = document.createElement('iframe')
        iframe.name = 'AIRportUi'
        this.stateService.iframe = iframe
      }
      if (!uiIFrameWrapper?.childElementCount) {
        uiIFrameWrapper?.appendChild(iframe)
      }
      let uiUrl = location.pathname.substring(4)
      if (uiUrl === 'undefined') {
        uiUrl = currentUiUrl
        history.replaceState(null, "", '/ui/' + uiUrl)
      }
      const uiHost = uiUrl.split('/')[0]
      if (currentUiUrl.split('/')[0] !== uiHost || !iframeExists) {
        iframe.src = uiUrl ? 'http://' + uiUrl.replace(/%2F/g, '/') : ''
        setTimeout(() => {
          this.stateService.currentUiUrl$.next(uiUrl)
        })
      }
    })
  }

  handleTurbaseLogoClick() {
    this.locationService.goTo("/tabs/applications")
  }

}
