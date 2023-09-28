import { airportApi, IUserAccountInfo } from '@airport/server'
import { Component } from '@angular/core';
import { StateService } from './services/state.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private stateService: StateService,
    private toastController: ToastController
  ) { }

  async onSignUp(
    userAccountInfo: IUserAccountInfo
  ): Promise<void> {
    if (!userAccountInfo) {
      return
    }
    try {
      await airportApi.signUp('signUp', userAccountInfo)
      this.stateService.isLoggedIn$.next(true);
    } catch (e) {
      let message = e as string
      if (e instanceof Error) {
        message = e.message
        console.error(e)
      }
      console.error(message)
      this.toastController.create({
        message,
        duration: 10000
      })
    }
  }
}
