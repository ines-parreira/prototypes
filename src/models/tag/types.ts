import {ListTagsOrderBy, OrderDirection, Tag} from '@gorgias/api-queries'

export type TagDraft = Pick<Tag, 'name'> & Partial<Pick<Tag, 'description'>>

export const ORDER_BY = [
    ListTagsOrderBy.CreatedDatetime,
    ListTagsOrderBy.Name,
    ListTagsOrderBy.Usage,
] as const

type OrderByTuple = typeof ORDER_BY
export type OrderBy = OrderByTuple[number]

export type OrderByOrderDir = `${OrderBy}:${OrderDirection}`
