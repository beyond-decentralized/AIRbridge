import { IRepository } from '@airport/server';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonPage, IonTitle, IonToolbar, useIonToast } from '@ionic/react';
import { chevronBackOutline, documentOutline, eyeOutline, refresh } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { getRepositories } from '../api';
import './RepositoriesPage.css';

const RepositoriesPage: React.FC = () => {
  const [repositories, setRepositories] = useState<IRepository[]>(() => null as any)

  useEffect(() => {
    getRepositories(setRepositories).then()
  }, [])

  let repositoriesFragment
  if (!repositories) {
    repositoriesFragment =
      <IonItem>
        Loading ...
      </IonItem>
  } else if (!repositories.length) {
    repositoriesFragment =
      <IonItem>
        No Repositories present
      </IonItem>
  } else {
    repositoriesFragment =
      <>
        {repositories.map(repository =>
          <IonItem key={repository.GUID}>
            <div>
              <div className="root-repository-name">
                {repository.name}
              </div>
              <div>
                <IonButton
                  href={repository.uiEntryUri}
                  fill="clear"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <IonIcon slot="start" icon={eyeOutline}></IonIcon>
                  View
                </IonButton>
                <IonButton
                  fill="clear"
                  routerLink={"./repository/" + repository.GUID}
                >
                  <IonIcon slot="start" icon={documentOutline}></IonIcon>
                  Details
                </IonButton>
              </div>
            </div>
          </IonItem>
        )}
      </>
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Loaded Repositories</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={e => getRepositories(setRepositories)}>
            <IonIcon icon={refresh} />
          </IonFabButton>
        </IonFab>
        {repositoriesFragment}
      </IonContent>
    </IonPage >
  );
};

export default RepositoriesPage;
