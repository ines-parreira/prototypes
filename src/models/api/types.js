//@flow
import {ORDER_DIRECTION, META_SORT_OPTIONS} from './constants'

export type ApiListResponse<T, Y> = {
    data: T,
    meta: Y,
    object: string,
    uri: string,
}

export type ApiListResponsePagination<T> = ApiListResponse<T, PaginationMeta>

export type PaginationMeta = {
    current_page: string,
    item_count: number,
    page: number,
    per_page: number,
    nb_pages: number,
}

export type OrderDirection = $Values<typeof ORDER_DIRECTION>

export type MetaSortOptions = $Values<typeof META_SORT_OPTIONS>
