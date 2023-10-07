import { Injectable, NgZone, SecurityContext } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { StateService } from './state.service'
import { combineLatest, distinctUntilChanged, filter } from 'rxjs'
import { airportApi } from '@airport/server'
import { DomSanitizer } from '@angular/platform-browser'

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  lastNavigationId: number = -1
  lastUiLocation: string = ''
  lastUiHostAndPath: string = ''

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private stateService: StateService,
    private zone: NgZone
  ) {
    combineLatest([
      router.events.pipe(
        filter(event => event instanceof NavigationStart)
      ),
      airportApi.getCurrentUiUrl(),
      stateService.isLoggedIn$.pipe(
        filter(isLoggedIn => isLoggedIn)
      )
    ]).pipe(
      distinctUntilChanged()
    ).subscribe(([
      routerEvent,
      currentUiUrl
    ]) => {
      const navigationStartEvent = (routerEvent as NavigationStart)

      this.navigateInUi(currentUiUrl, navigationStartEvent.url, navigationStartEvent.id)
    })

    // Handle back-button press
    // router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     console.log(`NavigationEnd: ${event.url}`)
    //   } else if (event instanceof NavigationStart) {
    //     // this.lastNavigationId = event.id
    //     if (event.restoredState) {
    //       this.lastNavigationId = event.restoredState.navigationId
    //       console.log(`navigationId: ${event.restoredState.navigationId}`)
    //       // back or forward navigation
    //       console.log(`Back Or Forward navigation: ${event.url}`)
    //     } else {
    //       console.log(`Non-back navigation: ${event.url}`)
    //     }
    //   }
    // })
  }

  goToUi(
    appUrlAndProtocol: string
  ): void {
    this.navigateInUi(appUrlAndProtocol, this.lastUiLocation, this.lastNavigationId)
  }

  private navigateInUi(
    currentUiUrl: string,
    currentLocation: string,
    navigationId: number
  ): void {
    const uiPathPrefix = '/tabs/ui/'

    let previousNavigationId = this.lastNavigationId
    this.lastNavigationId = navigationId

    // if currently navigating to a non UI page
    if (!currentLocation.startsWith(uiPathPrefix)
      && previousNavigationId !== navigationId) {
      return
    }

    let uiHostAndPath = ''
    let uiProtocol = ''
    let uiUrlSetByAIRport = ''
    if (currentLocation.endsWith('/')) {
      currentLocation = currentLocation.substring(0, currentLocation.length - 1)
    }

    currentLocation = currentLocation.replace(/%252F/g, '%2F')

    if (currentUiUrl) {
      const uiProtocolAndUrl = currentUiUrl.split('//')
      uiProtocol = uiProtocolAndUrl[0]
      uiHostAndPath = uiProtocolAndUrl[1]
      if (uiHostAndPath.endsWith('/')) {
        uiHostAndPath = uiHostAndPath.substring(0, uiHostAndPath.length - 1)
      }
      uiUrlSetByAIRport = uiHostAndPath.replace(/\//g, '%2F')
    } else if (currentLocation.startsWith(uiPathPrefix)) {
      uiHostAndPath = currentLocation.substring(uiPathPrefix.length)
      uiHostAndPath = uiHostAndPath.replace(/%2F/g, '/')
      uiProtocol = 'http:'
    }
    uiHostAndPath = this.sanitizer.sanitize(SecurityContext.URL,
      uiHostAndPath)?.toString() as string

    if (uiPathPrefix + uiUrlSetByAIRport === currentLocation
      || (!uiUrlSetByAIRport
        && !currentLocation.startsWith(uiPathPrefix))) {
      return
    }

    const iframeSourceLoaded = !!this.stateService.iframe
    const uiFrameSource = uiHostAndPath ? `${uiProtocol}//${uiHostAndPath}` : ''
    const uiHost = uiHostAndPath.split('/')[0]
    if (this.lastUiHostAndPath.split('/')[0] !== uiHost || !iframeSourceLoaded) {
      this.stateService.uiFrameSource$.next(this.sanitizer.bypassSecurityTrustResourceUrl(uiFrameSource))
    }

    this.stateService.isUiShown$.next(true)
    this.stateService.isUiLoaded$.next(true)

    this.lastUiHostAndPath = uiHostAndPath
    this.lastUiLocation = currentLocation

    if (!this.stateService.iframe) {
      const iframe = document.getElementById('ui-iframe')
      this.stateService.iframe = iframe as HTMLIFrameElement
      airportApi.setUiIframe(uiFrameSource, iframe as HTMLIFrameElement, (callback: () => void) => {
        this.zone.runOutsideAngular(() => {
          callback()
        })
      })
    }
    if (uiUrlSetByAIRport) {
      this.router.navigate(['/tabs/ui', uiUrlSetByAIRport])
    }
  }

  goToNonUi(
    url: string
  ): void {
    this.router.navigate([url])
    this.stateService.isUiShown$.next(false)
  }

}
