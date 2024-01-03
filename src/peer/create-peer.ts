/* eslint-disable @typescript-eslint/ban-ts-comment */
import Peer, { DataConnection } from 'peerjs'
import { createEffect, createSignal, untrack } from 'solid-js'
import { PlayerStateMessage } from '~/stores/peers/create-peers-store'
import {
  useEntitiesStore,
  usePeersStore,
  usePlayerStore,
} from '~/stores/stores'

export const usePeer: () => void = () => {
  let peer: Peer | null = null
  const receiveQueue = []
  const [state, peerActions] = usePeersStore()
  const [player, playerActions] = usePlayerStore()
  const [entities, entityActions] = useEntitiesStore()
  const [connection, setConnection] = createSignal<DataConnection | null>(null)

  // todo: connection 改写为 createResource 的形式？

  createEffect(async () => {
    if (state.host && state.me) {
      if (!peer) {
        peer = await new Promise<Peer>((resolve, reject) => {
          const id = state.me?.id
          if (!id) {
            reject()
          }
          const p = new Peer(state.me?.id as string)
          p.on('open', () => {
            resolve(p)
          })
          p.on('error', (e) => {
            reject(e)
          })
        })

        if (state.me.id === state.host.id) {
          const x = await new Promise((resolve) => {
            if (!peer) {
              return
            }
            peer.on('connection', (conn) => {
              console.log('conn received', conn)
              setConnection(conn)
              resolve(conn)
            })
          })
        } else {
          const conn = peer.connect(state.host.id)
          setConnection(conn)
        }
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

    const allTracks = untrack(() =>
      Object.values(entities.tracks).map((e) => ({
        id: e.id,
        name: e.name,
        duration: e.duration,
      })),
    )

    if (state.me.id === state.host.id) {
      conn.on('open', () => {
        console.log('conn opened')
        const currentPlayerState = untrack(() => ({
          activeTrackIndex: player.activeTrackIndex,
          isPlaying: player.isPlaying,
          trackIds: player.trackIds,
          currentTime: player.currentTime,
          duration: player.duration,
          currentTimeChanged: true,
        }))

        const data = {
          type: 'state',
          data: currentPlayerState,
          meta: {
            tracks: currentTracks,
            time: Date.now(),
          },
        }

        conn.send(data)
      })
      conn.on('data', (d) => {
        // @ts-ignore
        if (d.type === 'requestTracks') {
          // @ts-ignore
          const { trackIds } = d.data as { trackIds: string[] }
          for (const trackId of trackIds) {
            const track = entities.tracks[trackId]
            console.log(track.fileWrapper.file)
            conn.send(track.fileWrapper.file)
          }
        }
      })
      conn.on('error', console.error)
    } else {
      conn.on('data', (d) => {
        async function updateLocalTrackIds(
          comingTracks: { id: string; name: string; duration: number }[],
          existingTracks: { id: string; name: string; duration: number }[],
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
                console.log(`d ${track.id}`)
                console.log(`a ${t.id}`)
                entityActions.removeTracks([track.id])
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
            }
          })

          playerActions.syncFromHost()
        }

        if (d instanceof Uint8Array) {
          const blob = new Blob([d])
          const file = new File([blob], 'import')
          entityActions.parseTracks([{ type: 'file', file }]).then((tracks) => {
            if (state.hostPlayerSateMessage) {
              // ts-ignore
              updateLocalTrackIds(
                state.hostPlayerSateMessage.meta.tracks,
                // 这个东西总是空，不会更新？或者是由于顺序问题？文件发送是并发的，来不及更新。。。
                // 并不是,parse 完了是有
                Object.values(tracks),
              ).then(() => {
                console.log('fff')
                receiveQueue.push(1)
                if (receiveQueue.length === 1) {
                  playerActions.syncFromHost()
                }
              })
            }
          })
        }
      })
      conn.on('error', console.error)
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
      currentTimeChanged: true,
    }

    const data = {
      type: 'state',
      data: currentPlayerState,
      meta: {
        tracks: currentTracks,
        time: Date.now(),
      },
    }

    conn.send(data)
  })
}
