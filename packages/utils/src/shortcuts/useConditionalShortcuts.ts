import { useEffect } from 'react'

import { shortcutManager } from './shortcutManager'
import type { KeyboardAction } from './types'

export function useConditionalShortcuts(
    mount: boolean,
    component = 'global',
    actions: Record<string, Partial<KeyboardAction>>,
) {
    useEffect(() => {
        if (!mount) return

        shortcutManager.bind(component, actions)

        return () => {
            shortcutManager.unbind(component)
        }
    }, [actions, component, mount])
}
