import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'repositories',
        loadChildren: () => import('../pages/repositories/repositories.module').then(m => m.RepositoriesPageModule)
      },
      {
        path: 'applications',
        loadChildren: () => import('../pages/applications/applications.module').then(m => m.ApplicationsPageModule)
      },
      {
        path: 'ui/:uiPath',
        loadChildren: () => import('../pages/user-interface/user-interface.module').then(m => m.UserInterfacePageModule)
      },
      {
        path: '',
        redirectTo: 'applications',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/applications',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
