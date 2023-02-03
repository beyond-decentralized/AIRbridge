import { IRepository } from '@airport/server';
import { IonAccordion, IonAccordionGroup, IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonPage, IonTitle, IonToolbar, useIonToast } from '@ionic/react';
import { chevronBackOutline, documentOutline, eyeOutline, refresh } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getRepository } from '../api';
import './JoinRepository.css';

const RepositoryPage: React.FC = () => {

  const { repositoryId, joinKey } = useParams<{ repositoryId: string; joinKey: string; }>();
  const [repository, setRepository] = useState<IRepository>(() => null as any)
  const [referencedRepositories, setReferencedRepositories] = useState<IRepository[]>(() => [])
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
      setReferencedRepositories,
      showToast
    ).then()
  }, [repositoryId])

  let repositoryGroupsFragment
  if (referencedRepositories && referencedRepositories.length) {
    repositoryGroupsFragment =
      <IonAccordionGroup>
        {referencedRepositories.map((repositoryGroup, groupIndex) =>
          <IonAccordion
            key={'repositoryGroup' + groupIndex}
            value={repositoryGroup.name}
          >
            <IonItem slot="header" color="light">
              <IonLabel>{repositoryGroup.name}</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              {referencedRepositories.map((referencedRepository, nestingIndex) =>
                <IonItem
                  color="light"
                  key={nestingIndex}
                  slot="header"
                >
                  <IonLabel>{referencedRepository.name}</IonLabel>
                  <IonButton
                    routerLink={'/repository/' + referencedRepository.GUID}
                    fill="clear"
                  >
                    <IonIcon slot="start" icon={documentOutline}></IonIcon>
                    Details
                  </IonButton>
                </IonItem>
              )}
            </div>
          </IonAccordion>
        )}
      </IonAccordionGroup>
  } else {
    repositoryGroupsFragment =
      <IonItem>
        No Nested Repositories found
      </IonItem>
  }

  let repositoryFragment
  if (!repository) {
    repositoryFragment =
      <IonItem>Loading ...</IonItem>
  } else {
    repositoryFragment =
      <>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={e => getRepository(repositoryId, setRepository, setReferencedRepositories, present)}>
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
        {repositoryGroupsFragment}
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
