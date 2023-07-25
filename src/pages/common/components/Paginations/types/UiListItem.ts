import {NavigationSize} from './NavigationSize'
import {RawListItem} from './RawListItem'

export interface UiListItem extends RawListItem {
    className?: string
    disabled?: boolean
    size: NavigationSize
    onClick: () => void
}
