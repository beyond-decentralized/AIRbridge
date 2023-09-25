import { toSignal } from '@angular/core/rxjs-interop';
import { Component, OnInit } from '@angular/core';
import { StateService } from '../../services/state.service';
import { DbApplication } from '@airport/server';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.page.html',
  styleUrls: ['./applications.page.scss'],
})
export class ApplicationsPage implements OnInit {

  applications = toSignal(this.stateService.applications$, {
    initialValue: []
  })

  constructor(
    private stateService: StateService
  ) { }

  ngOnInit() {
  }

  trackApplication(
    _index: number,
    application: DbApplication
  ): string {
    return application.fullName
  }

}
