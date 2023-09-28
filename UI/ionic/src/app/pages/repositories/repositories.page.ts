import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { StateService } from '../../services/state.service';
import { IRepository } from '@airport/server';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.page.html',
  styleUrls: ['./repositories.page.scss'],
})
export class RepositoriesPage implements OnInit, OnDestroy {

  repositories: WritableSignal<IRepository[]> = signal([])

  repositoriesSubscription: Subscription | null = null

  constructor(
    private stateService: StateService
  ) { }

  async ngOnInit(): Promise<void> {
    const repositories$ = await this.stateService.getRepositories()
    this.repositoriesSubscription = repositories$
      .subscribe(repositories => {
        this.repositories.set(repositories)
      })
  }

  ngOnDestroy(): void {
    this.repositoriesSubscription?.unsubscribe()
  }

  trackRepository(
    _index: number,
    repository: IRepository
  ): string {
    return repository.GUID
  }

}
