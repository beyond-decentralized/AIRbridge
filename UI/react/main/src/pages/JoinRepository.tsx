import { IRepository } from '@airport/server';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonPage, IonTitle, IonToolbar, useIonToast } from '@ionic/react';
import { chevronBackOutline, eyeOutline, refresh } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getRepository } from '../api';
import './JoinRepository.css';

const RepositoryPage: React.FC = () => {

  const { repositoryLid, joinKey } = useParams<{ repositoryLid: string; joinKey: string; }>();
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
      repositoryLid,
      setRepository,
      showToast
    ).then()
  }, [repositoryLid])

  let repositoryFragment
  if (!repository) {
    repositoryFragment =
      <IonItem>Loading ...</IonItem>
  } else {
    repositoryFragment =
      <>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={e => getRepository(repositoryLid, setRepository, present)}>
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
