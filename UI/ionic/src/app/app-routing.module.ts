import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'tabs/repositories',
    loadChildren: () => import('./pages/repositories/repositories.module').then(m => m.RepositoriesPageModule)
  },
  {
    path: 'repository/:repositoryGuid',
    loadChildren: () => import('./pages/repository/repository.module').then(m => m.RepositoryPageModule)
  },
  {
    path: 'tabs/applications',
    loadChildren: () => import('./pages/applications/applications.module').then(m => m.ApplicationsPageModule)
  },
  {
    path: 'tabs/ui/:uiPath',
    loadChildren: () => import('./pages/user-interface/user-interface.module').then(m => m.UserInterfacePageModule)
  },
  {
    path: 'user-interfaces',
    loadChildren: () => import('./pages/user-interfaces/user-interfaces.module').then(m => m.UserInterfacesPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
