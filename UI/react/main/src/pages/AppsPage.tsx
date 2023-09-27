import { IApplication } from '@airport/server';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonPage, IonTitle, IonToolbar, useIonToast } from '@ionic/react';
import { refresh } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { getApplications } from '../api';
import './AppsPage.css';

const AppsPage: React.FC = () => {
  const [applications, setApplications] = useState<IApplication[]>(() => [])
  const [present] = useIonToast()

  useEffect(() => {
    getApplications(setApplications, present)
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Apps</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Apps</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={e => getApplications(setApplications, present)}>
            <IonIcon icon={refresh} />
          </IonFabButton>
        </IonFab>
        {applications.map(application =>
          <IonItem key={application.fullName}>
            {application?.domain?.name}
            <br />
            {application.name}
          </IonItem>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AppsPage;
