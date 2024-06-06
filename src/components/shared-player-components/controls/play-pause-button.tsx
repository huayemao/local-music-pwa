import { JSXElement } from 'solid-js'
import { useEntitiesStore, usePlayerStore } from '../../../stores/stores'
import { clx } from '../../../utils'
import * as styles from './controls.css'

export const PlayPauseButton = (): JSXElement => {
  const [playerState, playerActions] = usePlayerStore()
  const [entities, entityActions] = useEntitiesStore()
  return (
    <button
      title={playerState.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      disabled={!Object.values(entities.tracks).length}
      onClick={() => {
        if (!playerState.activeTrack) {
          playerActions.playRandomTrack()
          return
        }
        playerActions.playPause()
      }}
      class={styles.playPauseButton}
    >
      <div
        class={clx(
          styles.playPauseIcon,
          playerState.isPlaying && styles.playing,
        )}
      >
        <div class={styles.playPauseIconBar} />
        <div class={clx(styles.playPauseIconBar, styles.flippedY)} />
      </div>
    </button>
  )
}


