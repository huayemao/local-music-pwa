import { RouteDefinition } from 'solid-app-router'
import { lazy } from 'solid-js'

const route: RouteDefinition = {
  path: '/room',
  component: lazy(() => import('./room')),
}

export default route
