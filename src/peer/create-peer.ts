/* eslint-disable @typescript-eslint/ban-ts-comment */
import Peer, { DataConnection } from 'peerjs'
import { createEffect, createSignal, untrack } from 'solid-js'
import { toast } from '~/components/toast/toast'
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
        try {
          peerActions.setState('stage', 'initiating')
          peer = await new Promise<Peer>((resolve, reject) => {
            const id = state.me?.id
            if (!id) {
              reject()
            }
            const p = new Peer(state.me?.id as string, {
              config: {
                // iceTransportPolicy: 'relay',
                iceServers: [
                  // {
                  //   urls: 'stun:hk-turn1.xirsys.com',
                  // },
                  // {
                  //   urls: 'stun:stun.softjoys.com',
                  // },
                  // {
                  //   urls: 'stun:stun.voipbuster.com:3478',
                  // },
                  {
                    username:
                      'EvcKbZMh4KduyQon1Bessr9YSruwyUJ9Jb2jHeCRp1pZwNGMauzxecSVJE0bIvmcAAAAAGWWTJBodWF5ZW1hbw==',
                    urls: [
                      'stun:hk-turn1.xirsys.com',
                      'turn:hk-turn1.xirsys.com:80?transport=udp',
                      'turn:hk-turn1.xirsys.com:3478?transport=udp',
                      'turn:hk-turn1.xirsys.com:80?transport=tcp',
                      'turn:hk-turn1.xirsys.com:3478?transport=tcp',
                      'turns:hk-turn1.xirsys.com:443?transport=tcp',
                      'turns:hk-turn1.xirsys.com:5349?transport=tcp',
                    ],
                    credential: '6568f5f6-aac8-11ee-9a24-0242ac120004',
                  },
                  // {
                  //   username:
                  //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
                  //   url: 'turn:hk-turn1.xirsys.com:80?transport=udp',
                  //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
                  // },
                  // {
                  //   username:
                  //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
                  //   url: 'turn:hk-turn1.xirsys.com:3478?transport=udp',
                  //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
                  // },
                  // {
                  //   username:
                  //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
                  //   url: 'turn:hk-turn1.xirsys.com:80?transport=tcp',
                  //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
                  // },
                  // {
                  //   username:
                  //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
                  //   url: 'turn:hk-turn1.xirsys.com:3478?transport=tcp',
                  //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
                  // },
                  // {
                  //   username:
                  //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
                  //   url: 'turns:hk-turn1.xirsys.com:443?transport=tcp',
                  //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
                  // },
                  // {
                  //   username:
                  //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
                  //   url: 'turns:hk-turn1.xirsys.com:5349?transport=tcp',
                  //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
                  // },
                ],
              },
            })
            p.on('open', () => {
              resolve(p)
            })
            p.on('error', (e) => {
              reject(e)
            })
          })
          peerActions.setState('stage', 'initiated')

          if (state.me.id === state.host.id) {
            const conn = await new Promise<DataConnection>(
              (resolve, reject) => {
                ;(peer as Peer).on('connection', (_conn) => {
                  console.log('conn received', _conn)
                  resolve(_conn)
                })
              },
            )
            setConnection(conn)
          } else {
            const conn = peer.connect(state.host.id)
            setConnection(conn)
          }
          peerActions.setState('stage', 'connected')
        } catch (error) {
          toast({
            message: `fail to init, most possibly unstable network issue, please have a try later\n${
              error as string
            }`,
            duration: false,
          })
          peerActions.setState({ stage: 'failed' })
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

    if (state.me.id === state.host.id) {
      conn.on('open', () => {
        console.log('conn opened')
        peerActions.setState('stage', 'open')
        const stateMessage = untrack(() => {
          const currentPlayerState = {
            activeTrackIndex: player.activeTrackIndex,
            isPlaying: player.isPlaying,
            trackIds: player.trackIds,
            currentTime: player.currentTime,
            duration: player.duration,
            currentTimeChanged: true,
          }

          return {
            type: 'state',
            data: currentPlayerState,
            meta: {
              tracks: currentTracks,
              time: Date.now(),
            },
          }
        })

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

    if (conn.open) {
      conn.send(data)
    }
  })
}
