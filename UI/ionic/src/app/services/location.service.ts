import { Injectable } from '@angular/core'
import { NavigationEnd, NavigationStart, Router } from '@angular/router'
import { StateService } from './state.service'
import { combineLatest } from 'rxjs'

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
        console.log(`NavigationEnd: ${event.url}`)
      } else if (event instanceof NavigationStart) {
        if (event.restoredState) {
          event.restoredState.navigationId
          console.log(`navigationId: ${event.restoredState.navigationId}`)
          // back or forward navigation
          console.log(`Back Or Forward navigation: ${event.url}`)
        } else {
          console.log(`Non-back navigation: ${event.url}`)
        }
      }
    })
    combineLatest([
      stateService.currentUiUrl$,
      stateService.isLoggedIn$
    ]).subscribe(([
      currentUiUrl,
      isLoggedIn
    ]) => {
      if (!isLoggedIn) {
        return
      }
      let iframe = stateService.iframe
      const uiIFrameWrapper = document.getElementById('ui-iframe-wrapper')
      const iframeExists = !!iframe
      if (!iframeExists) {
        iframe = document.createElement('iframe')
        iframe.name = 'AIRportUi'
        iframe.style.border = 'none'
        iframe.style.height = '100%'
        iframe.style.width = '100%'
        stateService.iframe = iframe
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
          stateService.currentUiUrl$.next(uiUrl)
        })
      }
    })
  }

  goTo(
    url: string
  ): void {
    this.router.navigate([url])
  }

}
