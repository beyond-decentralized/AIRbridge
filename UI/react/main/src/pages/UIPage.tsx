import { useLocation } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import './UIPage.css';
import { useContext, useEffect } from 'react';
import { CurrentUiStateContext, UiStateContext, dispatchers } from '../api';

const UIPage: React.FC = () => {
    const location = useLocation()
    const uiState = useContext(UiStateContext)
    const currentUiState = useContext(CurrentUiStateContext)

    useEffect(() => {
        let isUIShown = location.pathname.startsWith('/ui/')
        if (isUIShown) {
            navigateInApp()
        }
    }, [uiState, location]);

    function navigateInApp() {
        if (!uiState.isLoggedIn) {
            return
        }

        let iframe = currentUiState.iframe
        const uiIFrameWrapper = document.getElementById('ui-iframe-wrapper')
        const iframeExists = !!iframe
        if (!iframeExists) {
            iframe = document.createElement('iframe')
            iframe.name = 'AIRportUi'
        }
        if (!uiIFrameWrapper?.childElementCount) {
            uiIFrameWrapper?.appendChild(iframe)
        }
        let uiUrl = location.pathname.substring(4)
        if (uiUrl === 'undefined') {
            uiUrl = currentUiState.currentUiUrl
            history.replaceState(null, "", '/ui/' + uiUrl)
        }
        if (currentUiState.currentUiUrl !== uiUrl || !iframeExists) {
            iframe.src = uiUrl ? 'http://' + uiUrl.replaceAll('%2F', '/') : ''
            dispatchers.setCurrentUiState({
                iframe,
                currentUiUrl: uiUrl
            })
        }
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <div
                    className="ui-iframe-wrapper"
                    id="ui-iframe-wrapper">
                </div>
            </IonContent>
        </IonPage>
    )
}

export default UIPage;
