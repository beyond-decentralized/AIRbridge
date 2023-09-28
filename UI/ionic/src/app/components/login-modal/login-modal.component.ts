import { IUserAccountInfo } from '@airport/server'
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {

  @ViewChild(IonModal) modal?: IonModal
  @Input() triggerId?: string;
  @Output() onSignUp: EventEmitter<IUserAccountInfo>
    = new EventEmitter<IUserAccountInfo>();

  canSignUp: boolean = false
  isOpen = true
  username: string = ''

  constructor() { }

  ngOnInit() { }

  willDismiss(event: Event): void {
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
    this.onSignUp.emit({
      email: this.username + '@random-email-provider.com',
      username: this.username
    })
    this.modal?.dismiss()
  }

}
