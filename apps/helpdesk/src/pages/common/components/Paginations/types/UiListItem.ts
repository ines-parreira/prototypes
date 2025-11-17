import type { NavigationSize } from './NavigationSize'
import type { RawListItem } from './RawListItem'

export interface UiListItem extends RawListItem {
    className?: string
    disabled?: boolean
    size: NavigationSize
    onClick: () => void
}
