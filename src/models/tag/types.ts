import {MetaSortOptions, OrderDirection} from '../api/types'

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
    CreatedDatetime = 'createdDatetime',
    Name = 'name',
    UpdatedDatetime = 'updatedDatetime',
    Usage = 'usage',
}

export type FetchTagsOptions = {
    orderBy?: TagSortableProperties | MetaSortOptions
    orderDir?: OrderDirection
    page?: number
    search?: string
}
