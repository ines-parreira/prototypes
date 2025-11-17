import type { OrderDirection, Tag } from '@gorgias/helpdesk-queries'
import { ListTagsOrderBy } from '@gorgias/helpdesk-queries'

export type TagDraft = Pick<Tag, 'name'> & Partial<Pick<Tag, 'description'>>

export const ORDER_BY = [
    ListTagsOrderBy.CreatedDatetime,
    ListTagsOrderBy.Name,
    ListTagsOrderBy.Usage,
] as const

type OrderByTuple = typeof ORDER_BY
export type OrderBy = OrderByTuple[number]

export type OrderByOrderDir = `${OrderBy}:${OrderDirection}`
