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

export enum OrderDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export enum MetaSortOptions {
    Relevance = 'relevance',
}
