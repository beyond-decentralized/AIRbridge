import {
  IonApp,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AirLoginModal } from '@airbridge/ui-react-components'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

import { useIonToast } from '@ionic/react'

/* Theme variables */
import './theme/variables.css'
import { CurrentUiStateContext, ICurrentUiState, IUiState, UiStateContext, dispatchers, signUp, getCurrentUiState, getUiState } from './api'
import Layout from './Layout'
import { useEffect, useState } from 'react'

import './ui'

setupIonicReact();

const App: React.FC = () => {
  const [present] = useIonToast()

  const [uiState, setUiState] = useState<IUiState>(() => getUiState())
  const [currentUiState, setCurrentUiState] = useState<ICurrentUiState>(() => getCurrentUiState())

  useEffect(() => {
    dispatchers.setCurrentUiState = setCurrentUiState
    dispatchers.setUiState = setUiState
  }, [])

  return (
    <UiStateContext.Provider value={uiState}>
      <CurrentUiStateContext.Provider value={currentUiState}>
        <IonApp>
          <AirLoginModal
            onWillDismiss={e => signUp(e, present)}
            triggerId="bogus"
          />
          <IonReactRouter>
            <Layout></Layout>
          </IonReactRouter>
        </IonApp>
      </CurrentUiStateContext.Provider>
    </UiStateContext.Provider>
  )
}

export default App;
