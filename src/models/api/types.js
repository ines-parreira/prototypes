//@flow
import {ORDER_DIRECTION, META_SORT_OPTIONS} from './constants.ts'

export type ContentType =
    | 'application/json'
    | 'application/x-www-form-urlencoded'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

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
    next_page?: string,
}

export type OrderDirection = $Values<typeof ORDER_DIRECTION>

export type MetaSortOptions = $Values<typeof META_SORT_OPTIONS>
