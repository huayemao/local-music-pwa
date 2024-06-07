import { setElementVars } from '@vanilla-extract/dynamic'
import { createEffect } from 'solid-js'
import { useLocation } from 'solid-app-router'
import { toast } from '~/components/toast/toast'
import { usePeer } from '~/peer/create-peer'
import { colorsTheme } from '~/styles/vars.css'
import { useAudioPlayer } from '../../audio/create-audio-player'
import { installGlobalRipple } from '../../helpers/ripple/install-global-ripple'
import { usePlayerStore } from '../../stores/stores'
import { registerServiceWorker } from '../../sw/register-sw'
import { useDarkThemeEnabled } from '../../utils'
import * as styles from './app.css'

export const useSetupApp = (): void => {
  useAudioPlayer()
  usePeer()

  const [playerState] = usePlayerStore()
  const location = useLocation()

  const isDarkTheme = useDarkThemeEnabled()

  const titlebarElement = document.querySelector(
    'meta[name="theme-color"]',
  ) as HTMLMetaElement

  createEffect(() => {
    const isDark = isDarkTheme()
    const argb = playerState.activeTrack?.primaryColor

    const doc = document.documentElement

    if (argb === undefined) {
      type EmptyTheme = {
        [key in keyof typeof colorsTheme]: string
      }

      const emptyTheme = Object.fromEntries(
        Object.entries(colorsTheme).map(([key]) => [key, '']),
      ) as EmptyTheme

      setElementVars(doc, colorsTheme, emptyTheme)
      return
    }

    const { pathname } = location

    import('~/helpers/app-theme').then((module) => {
      const scheme = module.getAppTheme(argb, isDark)
      setElementVars(doc, colorsTheme, scheme)

      titlebarElement.content =
        pathname === '/player' ? scheme.secondaryContainer : scheme.surface
    })
  })

  registerServiceWorker({
    onNeedRefresh(updateSW) {
      toast({
        message: 'An app update is available',
        duration: false,
        controls: [
          {
            title: 'Reload',
            action: () => {
              updateSW()
            },
          },
        ],
      })
    },
  })

  installGlobalRipple(styles.interactable)
}
