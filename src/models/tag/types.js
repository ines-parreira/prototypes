//@flow
import {type MetaSortOptions, type OrderDirection} from '../api'

import {TAG_SORTABLE_PROPERTIES} from './constants.ts'

type TagDecoration = {
    color?: string,
}

export type TagDraft = {
    name: string,
    description?: string,
}

export type Tag = TagDraft & {
    created_datetime: string,
    decoration: TagDecoration,
    deleted_datetime?: string,
    description?: string,
    id: number,
    uri: string,
    usage: number,
}

export type TagSortableProperties = $Values<typeof TAG_SORTABLE_PROPERTIES>

export type FetchTagsOptions = {
    orderBy?: TagSortableProperties | MetaSortOptions,
    orderDir?: OrderDirection,
    page?: number,
    search?: string,
}
