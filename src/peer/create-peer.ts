/* eslint-disable @typescript-eslint/ban-ts-comment */
import Peer, { DataConnection } from 'peerjs'
import { createEffect, createSignal, untrack } from 'solid-js'
import { toast } from '~/components/toast/toast'
import { tracksParser } from '~/helpers/tracks-file-parser/tracks-file-parser'
import { PlayerStateMessage, User } from '~/stores/peers/create-peers-store'
import {
  useEntitiesStore,
  usePeersStore,
  usePlayerStore,
} from '~/stores/stores'
import { UnknownTrack } from '~/types/types'
import { config } from './config'

function getTrackId(
  t: UnknownTrack,
  comingTracks: readonly Readonly<{
    id: string
    name: string
    duration: number
  }>[],
) {
  for (const track of comingTracks) {
    if (t.name === track.name && t.duration === track.duration) {
      return track.id
    }
  }
  throw Error('cannot find matching track')
}

export const usePeer: () => void = () => {
  let peer: Peer | null = null
  const receiveQueue = []
  const [state, peerActions] = usePeersStore()
  const [player, playerActions] = usePlayerStore()
  const [entities, entityActions] = useEntitiesStore()
  const [connection, setConnection] = createSignal<DataConnection | null>(null)

  async function createPeer(me: User, host: User) {
    try {
      peerActions.setState('stage', 'initiating')
      peer = await new Promise<Peer>((resolve, reject) => {
        const id = me?.id
        if (!id) {
          reject()
        }
        const p = new Peer(me?.id, {
          config,
        })
        p.on('open', () => {
          resolve(p)
        })
        p.on('error', (e) => {
          reject(e)
        })
      })
      peerActions.setState('stage', 'initiated')

      if (me.id === host.id) {
        const conn = await new Promise<DataConnection>((resolve, reject) => {
          ;(peer as Peer).on('connection', (_conn) => {
            console.log('conn received', _conn)
            resolve(_conn)
          })
        })
        setConnection(conn)
      } else {
        const conn = peer.connect(host.id)
        setConnection(conn)
      }
      peerActions.setState('stage', 'connected')
    } catch (error) {
      toast({
        message: `fail to init, most possibly unstable network issue, please have a try later\n${
          error as string
        }`,
        duration: false,
        controls: [
          {
            title: 'Retry',
            action: () => {
              createPeer(me, host)
            },
          },
        ],
      })
      peerActions.setState({ stage: 'failed' })
    }
    return peer
  }

  // todo: connection 改写为 createResource 的形式？

  createEffect(async () => {
    if (state.host && state.me) {
      if (!peer) {
        peer = await createPeer(state.me, state.host)
      } else {
        peer.disconnect()
        peer.destroy()
      }
    }
  })

  createEffect(() => {
    if (!(state.host && state.me)) {
      return
    }
    const conn = connection()
    if (!conn) {
      return
    }
    const currentTracks = untrack(() =>
      Object.values(entities.tracks)
        .filter((t) => player.trackIds.includes(t.id))
        .map((e) => ({
          id: e.id,
          name: e.name,
          duration: e.duration,
        })),
    )

    if (state.me.id === state.host.id) {
      conn.on('open', () => {
        console.log('conn opened')
        peerActions.setState('stage', 'open')
        const stateMessage = untrack(() => ({
          type: 'state',
          data: {
            activeTrackIndex: player.activeTrackIndex,
            isPlaying: player.isPlaying,
            trackIds: player.trackIds,
            currentTime: player.currentTime,
            duration: player.duration,
            currentTimeChanged: true,
          },
          meta: {
            tracks: currentTracks,
            time: Date.now(),
          },
        }))

        conn.send(stateMessage)
      })
      conn.on('data', (d) => {
        // @ts-ignore
        if (d.type === 'requestTracks') {
          // @ts-ignore
          const { trackIds } = d.data as { trackIds: string[] }
          for (const trackId of trackIds) {
            const track = entities.tracks[trackId]
            // todo: fileHandle 需要先获取文件
            console.log(track.fileWrapper.file)

            if (track.fileWrapper.type === 'file') {
              conn.send(track.fileWrapper.file)
            } else {
              const fileRef = track.fileWrapper.file

              fileRef.queryPermission({ mode: 'read' }).then(async (mode) => {
                if (mode !== 'granted') {
                  try {
                    // Try to request permission if it's not denied.
                    if (mode === 'prompt') {
                      mode = await fileRef.requestPermission({ mode: 'read' })
                    }
                  } catch {
                    // User activation is required to request permission. Catch the error.
                  }

                  if (mode !== 'granted') {
                    return null
                  }
                }
                conn.send(await fileRef.getFile())
                return null
              })
            }
          }
        }
        // @ts-ignore
        else if (d.type === 'user') {
          console.log('get user data', d)
          const { data } = d as {
            type: string
            data: { displayname: string; id: string }
          }
          peerActions.setState('members', data.id, data)
        }
      })
      conn.on('error', console.error)
    } else {
      conn.on('open', () => {
        console.log('conn opened')
        peerActions.setState('stage', 'open')
        conn.send({
          type: 'user',
          data: JSON.parse(JSON.stringify(state.me)) as object,
        })
      })
      conn.on('data', (d) => {
        async function updateLocalTrackIds(
          comingTracks: readonly Readonly<{
            id: string
            name: string
            duration: number
          }>[],
          existingTracks: { id?: string; name: string; duration: number }[],
        ) {
          for (const t of comingTracks) {
            for (const track of existingTracks) {
              if (
                t.duration === track.duration &&
                t.name === track.name &&
                t.id !== track.id
              ) {
                const originalTrack = existingTracks.find(
                  (e) => e.name === t.name && e.duration === t.duration,
                )
                if (!originalTrack) {
                  throw Error('')
                }
                const newTrack = {
                  ...originalTrack,
                  id: t.id,
                }
                console.log(`d ${track.id || ''}`)
                console.log(`a ${t.id}`)

                if (track.id) {
                  entityActions.removeTracks([track.id])
                }
                // 需要先刪除，否则会由于文件名重复导致无法创建成功
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line no-await-in-loop
                await entityActions.addNewTracks([newTrack])
              }
            }
          }
        }

        if ((d as { type: string }).type === 'state') {
          const data = d as PlayerStateMessage
          peerActions.setHostPlayerState(data)

          playerActions.clearQueue()

          const comingTracks = data.meta.tracks

          updateLocalTrackIds(
            comingTracks,
            Object.values(entities.tracks),
          ).then(() => {
            const lackTracks = comingTracks
              .map((e) => e.id)
              .filter((t) => !Object.keys(entities.tracks).includes(t))
            console.log('lack:', lackTracks)

            if (lackTracks.length) {
              conn.send({
                type: 'requestTracks',
                data: {
                  trackIds: lackTracks,
                },
              })
            } else {
              playerActions.syncFromHost()
            }
          })
        }

        if (d instanceof Uint8Array) {
          const blob = new Blob([d])
          const file = new File([blob], 'import')

          tracksParser([{ type: 'file', file }], console.log).then((tracks) => {
            const newTracks = tracks.map((e) => {
              if (!state.hostPlayerSateMessage) {
                throw Error('')
              }
              const id = getTrackId(e, state.hostPlayerSateMessage.meta.tracks)
              return {
                ...e,
                id,
              }
            })
            console.log(newTracks)
            entityActions.addNewTracks(newTracks).then(() => {
              receiveQueue.push(1)
              toast({
                message: `Successfully imported or uptated ${newTracks.length} tracks to the library.`,
                duration: 4000,
                controls: undefined,
              })

              if (receiveQueue.length === 1) {
                playerActions.syncFromHost(true)
              }
            })
          })
        }
      })
      conn.on('error', (e) => {
        console.error(e.message)
        peerActions.setState('stage', 'failed')
      })
    }
  })

  createEffect(() => {
    if (!(state.host && state.me)) {
      return
    }

    if (!(state.me.id === state.host.id)) {
      return
    }
    const conn = connection()
    if (!conn) {
      return
    }

    console.log('syncing change to peer')
    const currentTracks = Object.values(entities.tracks)
      .filter((t) => player.trackIds.includes(t.id))
      .map((e) => ({
        id: e.id,
        name: e.name,
        duration: e.duration,
      }))

    const currentTime = untrack(() => player.currentTime)

    const currentPlayerState = {
      activeTrackIndex: player.activeTrackIndex,
      isPlaying: player.isPlaying,
      trackIds: player.trackIds,
      currentTime,
      duration: player.duration,
      currentTimeChanged: player.currentTimeChanged,
    }

    const data = {
      type: 'state',
      data: currentPlayerState,
      meta: {
        tracks: currentTracks,
        time: Date.now(),
      },
    }

    if (conn.open) {
      conn.send(data)
    }
  })
}
