import { useEffect } from 'react'

import shortcutManager from 'services/shortcutManager'
import { KeyboardAction } from 'services/shortcutManager/shortcutManager'

export default function useConditionalShortcuts(
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
