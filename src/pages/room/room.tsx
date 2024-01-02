import { JSXElement } from 'solid-js'
import { Icon } from '~/components/icon/icon'
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
      创建房间
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
      加入房间
    </button>
  )
}

const Room = (): JSXElement => {
  const [data] = usePeersStore()

  return (
    <Scaffold title='共享' scrollable>
      <ScrollContainer observeScrollState>
        {
          <div style={{ 'justify-content': 'flex-end' }}>
            <CreateRoomButton/>
            <JoinRoomButton/>
          </div>
        }
        <div>{data.me?.id}</div>
    
      </ScrollContainer>
    </Scaffold>
  )
}

export default Room
