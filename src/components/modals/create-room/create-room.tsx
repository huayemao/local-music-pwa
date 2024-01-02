import { createSignal } from 'solid-js'
import {
  usePeersStore
} from '../../../stores/stores'
import * as styles from '../../../styles/shared.css'
import { Modal } from '../../modal/modal'
import { InternalModalProps } from '../types'

interface JoinPlaylistProps {
  type: 'join'
  playlistId: string
}

interface CreatePlaylistProps {
  type: 'create'
  playlistId?: undefined
}

export type CreateJoinPlaylistProps = InternalModalProps &
  (JoinPlaylistProps | CreatePlaylistProps)

const CreateOrJoinPlaylistModal = (props: CreateJoinPlaylistProps) => {
  const [peers, peersActions] = usePeersStore()
  const [name, setName] = createSignal('')
  const [roomId, setRoomId] = createSignal('')

  const isCreateType = () => props.type === 'create'

  const onConfirmHandler = () => {
    if (isCreateType()) {
      peersActions.createRoom(name())
    } else {
      peersActions.join(roomId(), name())
    }
    props.close()
  }

  return (
    <Modal
      title={`${isCreateType() ? 'Create' : 'Join'} a room`}
      onConfirm={onConfirmHandler}
      onCancel={props.close}
      buttons={[
        { type: 'cancel', title: 'Cancel' },
        {
          type: 'confirm',
          title: isCreateType() ? 'Create' : 'Save',
          disabled: !name(),
        },
      ]}
    >
      {!isCreateType() && (
        <input
          value={''}
          type='text'
          placeholder='Enter the room Id'
          class={styles.textField}
          onInput={(e: InputEvent) =>
            setRoomId((e.target as HTMLInputElement).value)
          }
        />
      )}

      <input
        value={''}
        type='text'
        placeholder='Enter your nickname'
        class={styles.textField}
        onInput={(e: InputEvent) =>
          setName((e.target as HTMLInputElement).value)
        }
      />
    </Modal>
  )
}

export default CreateOrJoinPlaylistModal
