import { PageType } from './PageType'

export interface RawListItem {
    type: PageType
    selected: boolean
    page: number | null
}
