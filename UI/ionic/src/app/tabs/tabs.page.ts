import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  isUiShown = toSignal(this.stateService.isUiShown$, {
    requireSync: true
  });

  isUiLoaded = toSignal(this.stateService.isUiLoaded$, {
    initialValue: false
  })

  constructor(
    private stateService: StateService
  ) {
  }

  goToUi(): void {
    this.stateService.isUiShown$.next(true)
  }

}
