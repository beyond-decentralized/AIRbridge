import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  isHideTabBar = toSignal(this.stateService.isUiShown$, {
    requireSync: true
  });

  uiUrl = toSignal(this.stateService.uiLocation$, {
    requireSync: true
  })

  constructor(
    private stateService: StateService
  ) {
  }

}
