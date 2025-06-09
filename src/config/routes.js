import HomePage from '../components/pages/HomePage.jsx';
import Recent from '../pages/Recent.jsx';
import Shared from '../pages/Shared.jsx';
import Trash from '../pages/Trash.jsx';

export const routes = {
  myFiles: {
    id: 'myFiles',
    label: 'My Files',
    path: '/',
    icon: 'Folder',
    component: HomePage
  },
  recent: {
    id: 'recent',
    label: 'Recent',
    path: '/recent',
    icon: 'Clock',
    component: Recent
  },
  shared: {
    id: 'shared',
    label: 'Shared',
    path: '/shared',
    icon: 'Share2',
    component: Shared
  },
  trash: {
    id: 'trash',
    label: 'Trash',
    path: '/trash',
    icon: 'Trash2',
    component: Trash
  }
};

export const routeArray = Object.values(routes);