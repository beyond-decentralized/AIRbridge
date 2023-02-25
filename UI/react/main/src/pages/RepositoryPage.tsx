import { IRepository } from '@airport/server';
import { IonAccordion, IonAccordionGroup, IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonPage, IonTitle, IonToolbar, useIonToast } from '@ionic/react';
import { chevronBackOutline, documentOutline, eyeOutline, refresh } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getRepository } from '../api';
import './RepositoryPage.css';

const RepositoryPage: React.FC = () => {

  const { repositoryId } = useParams<{ repositoryId: string; }>();
  const [repository, setRepository] = useState<IRepository>(() => null as any)
  const [present, dismiss] = useIonToast()

  function showToast(
    message: string,
    duration = 3000
  ): void {
    present(message)
    setTimeout(() => {
      dismiss()
    }, duration)
  }

  useEffect(() => {
    getRepository(
      repositoryId,
      setRepository,
      showToast
    ).then()
  }, [repositoryId])

  let repositoryFragment
  if (!repository) {
    repositoryFragment =
      <IonItem>Loading ...</IonItem>
  } else {
    let referencedRepositoriesFragment
    if (repository.referencedRepositories && repository.referencedRepositories.length) {
      referencedRepositoriesFragment =
        repository.referencedRepositories.map((repositoryReference, referenceIndex) =>
          <IonItem
            color="light"
            key={referenceIndex}
            slot="header"
          >
            <IonLabel>{repositoryReference.referencedRepository.name}</IonLabel>
            <IonButton
              routerLink={'/repository/' + repositoryReference.referencedRepository.GUID}
              fill="clear"
            >
              <IonIcon slot="start" icon={documentOutline}></IonIcon>
              Details
            </IonButton>
          </IonItem>
        )
    } else {
      referencedRepositoriesFragment =
        <IonItem>
          No Referenced Repositories found
        </IonItem>
    }

    let referencedInRepositoriesFragment
    if (repository.referencedInRepositories && repository.referencedInRepositories.length) {
      referencedInRepositoriesFragment =
        repository.referencedInRepositories.map((repositoryReference, referenceIndex) =>
          <IonItem
            color="light"
            key={referenceIndex}
            slot="header"
          >
            <IonLabel>{repositoryReference.referencingRepository.name}</IonLabel>
            <IonButton
              routerLink={'/repository/' + repositoryReference.referencingRepository.GUID}
              fill="clear"
            >
              <IonIcon slot="start" icon={documentOutline}></IonIcon>
              Details
            </IonButton>
          </IonItem>
        )
    } else {
      referencedInRepositoriesFragment =
        <IonItem>
          No Repositories with references to this Repository found
        </IonItem>
    }

    repositoryFragment =
      <>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={e => getRepository(repositoryId, setRepository, present)}>
            <IonIcon icon={refresh} />
          </IonFabButton>
        </IonFab>
        <IonItem>
          <IonLabel>Name:</IonLabel>
          {repository.name}
        </IonItem>
        <IonButton
          href={repository.uiEntryUri}
          fill="clear"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IonIcon slot="start" icon={eyeOutline}></IonIcon>
          View
        </IonButton>

        <IonAccordionGroup>
          <IonAccordion value="first">
            <IonItem slot="header" color="light">
              <IonLabel>References</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              {referencedRepositoriesFragment}
            </div>
          </IonAccordion>
          <IonAccordion value="second">
            <IonItem slot="header" color="light">
              <IonLabel>Referenced In</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              {referencedInRepositoriesFragment}
            </div>
          </IonAccordion>
        </IonAccordionGroup>
      </>
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>{repository ? 'Repository' : 'Loading ...'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {repositoryFragment}
      </IonContent>
    </IonPage>
  );
};

export default RepositoryPage;
