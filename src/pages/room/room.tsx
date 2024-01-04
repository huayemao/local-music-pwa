import { For, JSXElement, Show } from 'solid-js'
import { Icon } from '~/components/icon/icon'
import { List } from '~/components/list/list'
import { useModals } from '~/components/modals/modals'
import { Scaffold } from '~/components/scaffold/scaffold'
import { ScrollContainer } from '~/components/scroll-container/scroll-container'
import * as sharedStyles from '~/styles/shared.css'
import { usePeersStore } from '../../stores/stores'

const CreateRoomButton = () => {
  const modals = useModals()

  return (
    <button
      class={sharedStyles.outlinedButton}
      onClick={() => {
        modals.createRoom.show({ type: 'create' })
      }}
    >
      <Icon icon='plus' />
      Create a Room
    </button>
  )
}

const JoinRoomButton = () => {
  const modals = useModals()

  return (
    <button
      class={sharedStyles.outlinedButton}
      style={{ margin: '0 2em 0' }}
      onClick={() => {
        modals.createRoom.show({ type: 'join' })
      }}
    >
      <Icon icon='plus' />
      Join a Room
    </button>
  )
}

const Room = (): JSXElement => {
  const [data] = usePeersStore()

  return (
    <Scaffold title='Coplay' scrollable>
      <ScrollContainer observeScrollState>
        <Show
          when={data.stage !== 'idle'}
          fallback={
            <div
              style={{
                height: '100%',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
              }}
            >
              <div
                style={{
                  'max-height': '300px',
                  display: 'flex',
                  'justify-content': 'center',
                }}
              >
                <CreateRoomButton />
                <JoinRoomButton />
              </div>
            </div>
          }
        >
          {data.stage === 'initiating' && <div>creating</div>}
          {data.stage === 'initiated' && (
            <div>
              <div>Room Id: {data.me?.id}</div>
              <div>waiting for connection...</div>
            </div>
          )}
          {data.stage === 'connected' && (
            <div>
              <div>Room Id: {data.me?.id}</div>
              <div>waiting for data...</div>
            </div>
          )}
          {data.stage === 'open' && <div>todo: renderList</div>}
        </Show>
        <List>
          <For each={Object.values(data.members)}>
            {(mb) => <div class={sharedStyles.listItem}>{mb.displayName}</div>}
          </For>
        </List>
      </ScrollContainer>
    </Scaffold>
  )
}

export default Room
