import { createContext, ParentComponent, useContext } from 'solid-js'
import { createEntitiesStore } from './entities/create-entities-store'
import { createLibraryStore } from './library/create-library-store'
import { createPeersStore } from './peers/create-peers-store'
import { PersistStoresProps, PersistStoresProvider } from './persist-stores'
import { createPlayerStore } from './player/create-player-store'

function createStoreCtx<T>(createStoreFn: () => T) {
  const StoreContext = createContext<T>()

  const Provider: ParentComponent = (props) => {
    const state = createStoreFn()
    return (
      <StoreContext.Provider value={state}>
        {props.children}
      </StoreContext.Provider>
    )
  }

  const useStateContext = () => useContext(StoreContext) as T

  return [Provider, useStateContext] as const
}

const [EntitiesProvider, useEntitiesStore] = createStoreCtx(createEntitiesStore)
const [LibraryProvider, useLibraryStore] = createStoreCtx(createLibraryStore)
const [PlayerProvider, usePlayerStore] = createStoreCtx(createPlayerStore)
const [PeersProvider, usePeersStore] = createStoreCtx(createPeersStore)

export { useEntitiesStore, useLibraryStore, usePeersStore, usePlayerStore }

// Only change version if there are breaking changes
// with persisted data. Changing version number
// will delete all previous storages.
const APP_STORAGE_VERSION = 1
const APP_STORAGE_NAME = 'APP_DATA'

export const RootStoresProvider: ParentComponent<
  Pick<PersistStoresProps, 'onLoad'>
> = (props) => (
  <EntitiesProvider>
    <PeersProvider>
      <LibraryProvider>
        <PlayerProvider>
          <PersistStoresProvider
            storageName={APP_STORAGE_NAME}
            version={APP_STORAGE_VERSION}
            useStores={[useEntitiesStore, useLibraryStore, usePlayerStore]}
          >
            {props.children}
          </PersistStoresProvider>
        </PlayerProvider>
      </LibraryProvider>
    </PeersProvider>
  </EntitiesProvider>
)
