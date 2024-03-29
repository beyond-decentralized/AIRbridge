import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './UIsPage.css';

const UIsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>UIs</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">UIs</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer>
        </ExploreContainer>
      </IonContent>
    </IonPage>
  );
};

export default UIsPage;
