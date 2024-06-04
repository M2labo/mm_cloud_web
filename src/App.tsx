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


]);



export  function App({ signOut, user }: WithAuthenticatorProps) {
  
  return (
    <>

      <RouterProvider router={router} />
    </>
  );
}

export default withAuthenticator(App);