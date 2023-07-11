import { Redirect, Route, useLocation } from 'react-router-dom';
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
    const location = useLocation()
    const [hideTabBar, setHideTabBar] = useState<boolean>()

    let hideTabBarClassName = ''
    if(hideTabBar) {
        hideTabBarClassName = 'hide-tab-bar'
    }
    
    useEffect(() => {
        let hideTabBar = location.pathname.startsWith('/ui')
        setHideTabBar(hideTabBar)
    }, [location]);

    return (
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
                <Route exact path="/ui">
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
                <IonTabButton tab="curret-user-interface" href="/ui">
                    <IonIcon icon={desktop} />
                    <IonLabel>UI</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    )
}

export default Layout;
