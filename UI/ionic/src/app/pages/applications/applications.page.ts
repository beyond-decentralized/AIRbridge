import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { StateService } from '../../services/state.service';
import { IApplication } from '@airport/server';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.page.html',
  styleUrls: ['./applications.page.scss'],
})
export class ApplicationsPage implements OnInit, OnDestroy {

  applications: WritableSignal<IApplication[]> = signal([])

  applicationsSubscription: Subscription | null = null

  constructor(
    private stateService: StateService
  ) { }

  async ngOnInit(): Promise<void> {
    const applications$ = await this.stateService.getApplications()
    this.applicationsSubscription = applications$
      .subscribe(applications => {
        this.applications.set(applications)
      })
  }

  ngOnDestroy(): void {
    this.applicationsSubscription?.unsubscribe()
  }

  trackApplication(
    _index: number,
    application: IApplication
  ): string {
    return application.fullName
  }

}
