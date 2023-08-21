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

    function iframeURLChange(iframe: HTMLIFrameElement, callback: (url: string) => void) {
        var unloadHandler = function () {
            // Timeout needed because the URL changes immediately after
            // the `unload` event is dispatched.
            setTimeout(function () {
                callback(iframe?.contentWindow?.location?.href as any);
            }, 0);
        };

        function attachUnload() {
            // Remove the unloadHandler in case it was already attached.
            // Otherwise, the change will be dispatched twice.
            iframe?.contentWindow?.removeEventListener("unload", unloadHandler);
            iframe?.contentWindow?.addEventListener("unload", unloadHandler);
        }

        iframe.addEventListener("load", attachUnload);
        attachUnload();
    }


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
            iframeURLChange(iframe, (newURL: string) => {
                console.log("URL changed:", newURL)
            })
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
