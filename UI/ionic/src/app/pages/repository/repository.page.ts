import { IRepository, IRepositoryReference } from '@airport/server'
import { Component, OnDestroy, OnInit, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { StateService } from 'src/app/services/state.service'

@Component({
  selector: 'app-repository',
  templateUrl: './repository.page.html',
  styleUrls: ['./repository.page.scss'],
})
export class RepositoryPage implements OnInit, OnDestroy {

  repository = signal<IRepository | null>(null)

  paramMapSubscription: Subscription
  repositorySubscription: Subscription | null = null
  currentRepositoryGuid: string | null = null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stateService: StateService
  ) {
    this.paramMapSubscription = this.route.paramMap
      .subscribe(paramMap => {
        let repositoryGuid = paramMap.get('repositoryGuid')

        if (!repositoryGuid
          || this.currentRepositoryGuid === repositoryGuid) {
          return
        }
        this.currentRepositoryGuid = repositoryGuid
        this.repositorySubscription?.unsubscribe()
        this.repositorySubscription = this.stateService
          .searchRepository$(repositoryGuid)
          .subscribe(repository => {
            this.repository.set(repository)
          })
      })
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.paramMapSubscription.unsubscribe()
    this.repositorySubscription?.unsubscribe()
  }

  referencedRepositoryTracking(
    _index: number,
    repositoryReference: IRepositoryReference
  ): string {
    return repositoryReference.referencedRepository.GUID
  }

  referencingRepositoryTracking(
    _index: number,
    repositoryReference: IRepositoryReference
  ): string {
    return repositoryReference.referencingRepository.GUID
  }

  viewRepository(): void {
    this.router.navigate(['/tabs/ui', this.repository()?.uiEntryUri])
  }

}
