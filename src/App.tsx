import { Amplify } from 'aws-amplify';
import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import config from './amplifyconfiguration.json';
import {createHashRouter, RouterProvider} from "react-router-dom";
import { Detail } from './Page/Detail/Detail';
import { Top } from './Page/Top/Top';
import { Log } from './Page/Log/Log';
import { Mm } from './Page/Mm/Mm';
import { Calendar } from './Page/Calendar/Calendar';
import { MapPage } from './Page/Map/MapPage';
import { Analysis } from './Page/Analysis/Analysis';
import { Chat } from './Page/Chat/Chat';
import {Setting} from "./Page/Setting/Setting";
import {Profile} from "./Page/Setting/Profile";
import {SettingList} from "./Page/Setting/SettingList";
import {Group} from "./Page/Setting/Group";
import {Mover} from "./Page/Setting/Mover";
import {Field} from "./Page/Setting/Field";
import {Version} from "./Page/Setting/Version";
import {TermsOfService} from "./Page/Setting/TermsOfService";
import {PrivacyPolicy} from "./Page/Setting/PrivacyPolicy";
import { UserProvider } from './UserContext';
import { Header } from './components/Header/Header';

Amplify.configure(config);




const router = createHashRouter([
  {
    path: '/',
    element: <Top />,
  },
  {
    path: "/mm/:mmId",
    element: <Mm />,
  },
  {
    path: '/log/:mmId/:date',
    element: <Log />,
  },
  {
    path: "/detail/:mmId/:date/:logId",
    element: <Detail />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  },
  {
    path: "/map",
    element: <MapPage />,
  },
  {
    path: "/analysis",
    element: <Analysis />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
  {
    path: "/setting",
    element: <Setting />,
    children: [
      { index: true, element: <SettingList /> },
      { path: 'profile', element: <Profile /> },
      { path: 'group', element: <Group /> },
      { path: 'mover', element: <Mover /> },
      { path: 'field', element: <Field /> },
      { path: 'version', element: <Version /> },
      { path: 'terms_of_service', element: <TermsOfService /> },
      { path: 'privacy_policy', element: <PrivacyPolicy /> },
    ]
  },


]);



export  function App({ signOut, user }: WithAuthenticatorProps) {
  const userId = user?.username;
  console.log('userId:', userId);
  return (
    <UserProvider cognitoUser={user}>
      <Header signOut={signOut || (() => {})} />
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default withAuthenticator(App);