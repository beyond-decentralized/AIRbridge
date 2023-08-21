import { Redirect, Route, useLocation, useHistory } from 'react-router-dom';
import { apps, briefcase, desktop } from 'ionicons/icons';

import {
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs
} from '@ionic/react';
import { useEffect, useState } from 'react';

import RepositoryPage from './pages/RepositoryPage';
import RootRepositoriesPage from './pages/RepositoriesPage';
import AppsPage from './pages/AppsPage';
import UIPage from './pages/UIPage';
import UIsPage from './pages/UIsPage';

import './Layout.css';

const Layout: React.FC = () => {
    const history = useHistory()
    // Must be done in a component that is nested inside <IonReactRouter>
    const location = useLocation()
    const [isHideTabBar, setIsHideTabBar] = useState<boolean>()
    const [uiUrl] = useState<string>()

    let hideTabBarClassName = ''
    if (isHideTabBar) {
        hideTabBarClassName = 'hide-tab-bar'
    }

    useEffect(() => {
        let isHideTabBar = location.pathname.startsWith('/ui/')
        setIsHideTabBar(isHideTabBar)
    }, [location]);

    function handleTurbaseLogoClick() {
        history.push("/applications")
    }

    return (
        <>
            {isHideTabBar && <div
                className="turbase-button-wrapper"
            ><img
                className="turbase-button"
                onClick={handleTurbaseLogoClick}
                src="assets/turbase-turbine.png"
            ></img>
            </div>}
            <IonTabs>
                <IonRouterOutlet>
                    <Route exact path="/rootRepositories">
                        <RootRepositoriesPage />
                    </Route>
                    <Route exact path="/repository/:repositoryId">
                        <RepositoryPage />
                    </Route>
                    <Route exact path="/applications">
                        <AppsPage />
                    </Route>
                    <Route exact path="/user-interfaces">
                        <UIsPage />
                    </Route>
                    <Route exact path="/">
                        <Redirect to="/rootRepositories" />
                    </Route>
                    <Route exact path="/ui/:uiUrl+">
                        <UIPage />
                    </Route>
                </IonRouterOutlet>
                <IonTabBar id="tab-bar" className={hideTabBarClassName} slot="bottom">
                    <IonTabButton tab="repositories" href="/rootRepositories">
                        <IonIcon icon={briefcase} />
                        <IonLabel>Repositories</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="applications" href="/applications">
                        <IonIcon icon={apps} />
                        <IonLabel>Apps</IonLabel>
                    </IonTabButton>
                    {/*
  Need to implement search for user interfaces based on the
  schemas of the currently loaded repositories
  <IonTabButton tab="user-interfaces" href="/user-interfaces">
    <IonIcon icon={desktop} />
    <IonLabel>UIs</IonLabel>
  </IonTabButton>
*/}
                    <IonTabButton tab="curret-user-interface" href={'/ui/' + uiUrl}>
                        <IonIcon icon={desktop} />
                        <IonLabel>UI</IonLabel>
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>
        </>
    )
}

export default Layout;
