import {useEffect} from 'react'

import shortcutManager from 'services/shortcutManager'
import {KeyboardAction} from 'services/shortcutManager/shortcutManager'

export default function useShortcuts(
    component = 'global',
    actions: Record<string, Partial<KeyboardAction>>
) {
    useEffect(() => {
        shortcutManager.bind(component, actions)

        return () => {
            shortcutManager.unbind(component)
        }
    }, [component, actions])
}
