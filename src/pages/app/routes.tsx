import { Navigate, RouteDefinition } from 'solid-app-router'
import aboutRoute from '../about/route'
import detailsRoutes from '../details/route'
import libraryRoute, {
  DEFAULT_LIBRARY_PATH,
  LIBRARY_PATH,
} from '../library/route'
import notFoundRoute from '../not-found/route'
import playerRoute from '../player/route'
import roomRoute from '../room/route'
import searchRoute from '../search/route'
import settingsRoute from '../settings/route'

export const ROUTES: RouteDefinition[] = [
  libraryRoute,
  playerRoute,
  ...detailsRoutes,
  searchRoute,
  settingsRoute,
  aboutRoute,
  roomRoute,
  {
    path: '/',
    children: [{ path: '/' }, { path: LIBRARY_PATH }],
    element: () => <Navigate href={DEFAULT_LIBRARY_PATH} />,
  },
  notFoundRoute,
]
