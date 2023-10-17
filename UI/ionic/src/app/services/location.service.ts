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

  lastNavigationStartEvent: NavigationStart | undefined
  lastNavigationId: number = -1
  lastUiLocation: string = ''
  lastAirportUiHostAndPath: string = ''
  lastAirportUiUrl: string = ''
  isLastNavigationToAirportUi = false

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private stateService: StateService,
    private zone: NgZone,
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
      currentAirportUiUrl
    ]) => {
      const navigationStartEvent = (routerEvent as NavigationStart)

      let restoredNavigationId
      if (this.lastNavigationStartEvent !== navigationStartEvent
        && navigationStartEvent.restoredState
        && navigationStartEvent.navigationTrigger === 'popstate') {
        restoredNavigationId = navigationStartEvent.restoredState?.navigationId
      }
      this.lastNavigationStartEvent = navigationStartEvent

      let changedAirportUiUrl = null
      if (currentAirportUiUrl !== this.lastAirportUiUrl) {
        changedAirportUiUrl = currentAirportUiUrl
      }

      this.navigateInUi(changedAirportUiUrl, navigationStartEvent.url,
        navigationStartEvent.id, restoredNavigationId)

      this.lastAirportUiUrl = currentAirportUiUrl
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

  private navigateInUi(
    changedAirportUiUrl: string | null,
    currentLocation: string,
    navigationId: number,
    restoredNavigationId?: number
  ): void {
    const uiPathPrefix = '/tabs/ui/'

    let previousNavigationId = this.lastNavigationId
    this.lastNavigationId = navigationId

    // if currently navigating to a non UI page
    if (!currentLocation.startsWith(uiPathPrefix)
      && previousNavigationId !== navigationId) {
      this.isLastNavigationToAirportUi = false
      return
    }

    if (this.isLastNavigationToAirportUi && restoredNavigationId) {
      if (restoredNavigationId < previousNavigationId) {
        airportApi.uiGoBack()
      } else {
        airportApi.uiGoForward()
      }
      this.lastNavigationId = restoredNavigationId
      return
    }

    let airportUiHostAndPath = ''
    let airportUiProtocol = ''
    let airportUiUrlSetByAIRport = ''
    if (currentLocation.endsWith('/')) {
      currentLocation = currentLocation.substring(0, currentLocation.length - 1)
    }

    // remove double URL encoding of forward slashes
    currentLocation = currentLocation.replace(/%252F/g, '%2F')

    if (changedAirportUiUrl) {
      const auiportUiProtocolAndUrl = changedAirportUiUrl.split('//')
      airportUiProtocol = auiportUiProtocolAndUrl[0]
      airportUiHostAndPath = auiportUiProtocolAndUrl[1]
      if (airportUiHostAndPath.endsWith('/')) {
        airportUiHostAndPath = airportUiHostAndPath.substring(0, airportUiHostAndPath.length - 1)
      }
      airportUiUrlSetByAIRport = airportUiHostAndPath.replace(/\//g, '%2F')
    } else if (currentLocation.startsWith(uiPathPrefix)) {
      airportUiHostAndPath = currentLocation.substring(uiPathPrefix.length)
      airportUiHostAndPath = airportUiHostAndPath.replace(/%2F/g, '/')
      airportUiProtocol = 'https:'
    }
    airportUiHostAndPath = this.sanitizer.sanitize(SecurityContext.URL,
      airportUiHostAndPath)?.toString() as string

    // Same UI URL as before
    // OR current location isn't  an AIRport UI location 
    // (is a framework page and its the entry into the Framework)
    if (uiPathPrefix + airportUiUrlSetByAIRport === currentLocation
      || (!airportUiUrlSetByAIRport
        && !currentLocation.startsWith(uiPathPrefix))) {
      this.isLastNavigationToAirportUi = true
      this.stateService.isUiShown$.next(true)
      return
    }

    const iframeSourceLoaded = !!this.stateService.iframe
    const airportUiFrameSource = airportUiHostAndPath ? `${airportUiProtocol}//${airportUiHostAndPath}` : ''
    const airportUiHostAndPathFragments = airportUiHostAndPath.split('/')
    const airportUiHost = airportUiHostAndPathFragments[0]
    airportUiHostAndPathFragments.shift()
    const airportUiPath = airportUiHostAndPathFragments.join('/')
    if (this.lastAirportUiHostAndPath.split('/')[0] !== airportUiHost || !iframeSourceLoaded) {
      this.stateService.uiFrameSource$.next(this.sanitizer.bypassSecurityTrustResourceUrl(airportUiFrameSource))
    } else if (!airportUiUrlSetByAIRport && this.lastAirportUiHostAndPath.split('/')[0] === airportUiHost) {
      airportApi.uiChangeUrl(airportUiPath, airportUiHost, airportUiProtocol)
    }

    this.stateService.isUiShown$.next(true)
    this.stateService.isUiLoaded$.next(true)

    this.lastAirportUiHostAndPath = airportUiHostAndPath
    this.lastUiLocation = currentLocation
    this.isLastNavigationToAirportUi = true

    if (!this.stateService.iframe) {
      const iframe = document.getElementById('ui-iframe')
      this.stateService.iframe = iframe as HTMLIFrameElement
      // airportApi.setUiIframe(uiFrameSource, iframe as HTMLIFrameElement)
      airportApi.setUiIframe(airportUiFrameSource, iframe as HTMLIFrameElement, (callback: () => void) => {
        this.zone.runOutsideAngular(() => {
          callback()
        })
      })
    }
    if (airportUiUrlSetByAIRport) {
      this.router.navigate(['/tabs/ui', airportUiUrlSetByAIRport])
    }
  }

  goToNonUi(
    url: string
  ): void {
    this.router.navigate([url])
    this.stateService.isUiShown$.next(false)
  }

}
