import {ApiPaginationParams} from 'models/api/types'

export type FetchWidgetsOptions = ApiPaginationParams & {
    orderBy?:
        | 'order:asc'
        | 'order:desc'
        | 'created_datetime:asc'
        | 'created_datetime:desc'
}
