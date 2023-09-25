import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserInterfacesPage } from './user-interfaces.page';

const routes: Routes = [
  {
    path: '',
    component: UserInterfacesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserInterfacesPageRoutingModule {}
