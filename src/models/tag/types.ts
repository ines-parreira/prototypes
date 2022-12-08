import {
    ApiCursorPaginationParams,
    MetaSortOptions,
    OrderParams,
} from 'models/api/types'

export type TagDecoration = {
    color?: string
}

export type TagDraft = {
    name: string
    description?: string
}

export type Tag = Omit<TagDraft, 'description'> & {
    created_datetime: string
    decoration: TagDecoration
    deleted_datetime: Maybe<string>
    description: Maybe<string>
    id: number
    uri: string
    usage: number
}

export enum TagSortableProperties {
    CreatedDatetime = 'created_datetime',
    Name = 'name',
    UpdatedDatetime = 'updated_datetime',
    Usage = 'usage',
}

export type FetchTagsOptions = ApiCursorPaginationParams &
    OrderParams<TagSortableProperties | MetaSortOptions> & {
        page?: number
        search?: string
    }
