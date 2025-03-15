import AddStreetGuard from "./pages/ControlPage/AddStreetGuard";
import MainControl from "./pages/ControlPage/MainControl";
import Home from "./pages/MainHome/Home";
import Analysis from "./pages/Analysis/Analysis";

const routes = [
  {
    name: 'root',
    path: '/',
    element: Home,
  },
  {
    name: 'controller',
    path: '/controller',
    element: MainControl,
  },
  {
    name: 'add-streetguard',
    path: '/add-streetguard',
    element: AddStreetGuard,
  }
];

export default routes;