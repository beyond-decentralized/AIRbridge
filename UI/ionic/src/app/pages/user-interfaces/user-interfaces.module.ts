import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserInterfacesPageRoutingModule } from './user-interfaces-routing.module';

import { UserInterfacesPage } from './user-interfaces.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserInterfacesPageRoutingModule
  ],
  declarations: [UserInterfacesPage]
})
export class UserInterfacesPageModule {}
