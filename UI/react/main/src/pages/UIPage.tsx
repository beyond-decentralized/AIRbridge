import { IonContent, IonPage } from '@ionic/react';
import './UIPage.css';

const UIPage: React.FC = () => {
    let url = '';

    return (
        <IonPage>
            <IonContent fullscreen>
                <iframe
                    name='ui-iframe'
                    src={url}
                ></iframe>
            </IonContent>
        </IonPage>
    )
}

export default UIPage;
