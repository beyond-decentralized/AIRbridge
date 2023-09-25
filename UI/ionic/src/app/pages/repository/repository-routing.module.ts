import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RepositoryPage } from './repository.page';

const routes: Routes = [
  {
    path: '',
    component: RepositoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepositoryPageRoutingModule {}
