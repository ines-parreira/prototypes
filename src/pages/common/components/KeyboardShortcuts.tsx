import useShortcuts from 'hooks/useShortcuts'
import {KeymapActions} from 'services/shortcutManager/shortcutManager'

type Props = {
    name: string
    keymap: KeymapActions
}

// this component should not be used, use `useShortcuts` in a component directly
export default function KeyboardShortcuts({keymap = {}, name = ''}: Props) {
    useShortcuts(name, keymap)
    return null
}
