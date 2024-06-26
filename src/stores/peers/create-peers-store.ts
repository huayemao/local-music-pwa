import { batch } from 'solid-js'
import { createStore } from 'solid-js/store'

export type PlayerStateMessage = {
  type: string
  data: {
    activeTrackIndex: number
    isPlaying: boolean
    trackIds: readonly string[]
    currentTime: number
    duration: number
    currentTimeChanged: boolean
  }
  meta: {
    tracks: {
      id: string
      name: string
      duration: number
    }[]
    time: number
  }
}
export interface User {
  displayName: string
  id: string
}

interface State {
  stage: 'idle' | 'initiating' | 'initiated' | 'connected' | 'open' | 'failed'
  me: User | null
  host: User | null
  hostPlayerSateMessage: PlayerStateMessage | null
  members: Record<string, User>
}

export const createPeersStore = () => {
  const [state, setState] = createStore<State>({
    stage: 'idle',
    me: null,
    host: null,
    hostPlayerSateMessage: null,
    members: {},
  })

  const setHostPlayerState = (msg: PlayerStateMessage) => {
    setState('hostPlayerSateMessage', msg)
  }

  const join = (roomId: string, username: string) => {
    batch(() => {
      setState({
        me: {
          id: username,
          displayName: username,
        },
        host: {
          id: roomId,
          displayName: 'host',
        },
      })
    })
  }

  const createRoom = (username: string) => {
    batch(() => {
      const id = username
      const user = {
        id,
        displayName: username,
      }
      setState({
        me: user,
        host: user,
      })
    })
  }

  const actions = {
    join,
    createRoom,
    setHostPlayerState,
    setState,
  }

  return [state, actions] as const
}
