import { IUserAccountInfo } from '@airport/server'
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {

  @ViewChild(IonModal) modal?: IonModal
  @Input() triggerId?: string;
  @Output() onWillDismiss: EventEmitter<CustomEvent<OverlayEventDetail<IUserAccountInfo>>> = new EventEmitter<CustomEvent<OverlayEventDetail<IUserAccountInfo>>>();

  canSignUp: boolean = false
  isOpen = true
  username: string = ''

  constructor() { }

  ngOnInit() { }

  willDismiss(event: Event): void {
    const overlayEventDetailEvent = event as CustomEvent<OverlayEventDetail<IUserAccountInfo>>;
    this.onWillDismiss.emit(overlayEventDetailEvent);
  }

  usernameChanged(event: Event): void {
    this.canSignUp = (event.target as HTMLInputElement)?.value.length >= 3
  }

  signUp(): void {
    if (!this.canSignUp) {
      alert("Username must be at least 3 characters long")
      return
    }
    this.isOpen = false
    this.modal?.dismiss({
      email: this.username + '@random-email-provider.com',
      username: this.username
    }, 'signUp')
  }

}
