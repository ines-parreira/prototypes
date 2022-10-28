import {AxiosError} from 'axios'

export enum ContentType {
    Json = 'application/json',
    Form = 'application/x-www-form-urlencoded',
}

export enum HttpMethod {
    Get = 'GET',
    Post = 'POST',
    Put = 'PUT',
    Delete = 'DELETE',
}

export type ApiListResponse<T, Y> = {
    data: T
    meta: Y
    object: string
    uri: string
}

export type ApiListResponsePagination<T> = ApiListResponse<T, PaginationMeta>

export type PaginationMeta = {
    current_page: string
    item_count: number
    page: number
    per_page: number
    nb_pages: number
    next_page?: string
}

export type ApiListResponseCursorPagination<T> = ApiListResponse<T, CursorMeta>

export type CursorMeta = {
    next_cursor: string | null
    prev_cursor: string | null
}

export type OrderParams<T extends string> = {
    orderBy?: T
    orderDir?: OrderDirection
}

export enum OrderDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export enum MetaSortOptions {
    Relevance = 'relevance',
}

export type ApiCursorPaginationParams = {
    limit?: number
    cursor?: string
}

export type ApiPaginationParams = ApiCursorPaginationParams & {
    per_page?: number
    page?: number
}

export type GorgiasApiError<T = unknown> = Omit<AxiosError, 'response'> &
    Pick<
        Required<
            AxiosError<{
                error: GorgiasApiResponseDataError<T>
            }>
        >,
        'response'
    >

export type GorgiasApiResponseDataError<T = unknown> = {
    msg: string
    data: T
}
