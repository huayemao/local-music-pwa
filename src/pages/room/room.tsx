import { For, JSXElement } from 'solid-js'
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
    <Scaffold title='Co-Tune' scrollable>
      <ScrollContainer observeScrollState>
        {
          <div style={{ 'justify-content': 'flex-end' }}>
            <CreateRoomButton />
            <JoinRoomButton />
          </div>
        }
        <div>{data.me?.id}</div>
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
