import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RepositoryPageRoutingModule } from './repository-routing.module';

import { RepositoryPage } from './repository.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RepositoryPageRoutingModule
  ],
  declarations: [RepositoryPage]
})
export class RepositoryPageModule {}
