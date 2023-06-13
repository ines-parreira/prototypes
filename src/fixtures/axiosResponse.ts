import {AxiosResponse} from 'axios'
import {ApiListResponseCursorPagination} from 'models/api/types'

export function axiosSuccessResponse<D>(data: D): AxiosResponse<D> {
    return {
        data,
        status: 200,
        statusText: 'OK',
        config: {},
        headers: {},
    }
}

export function apiListCursorPaginationResponse<D>(
    data: D
): ApiListResponseCursorPagination<D> {
    return {
        data,
        uri: '',
        object: '',
        meta: {
            next_cursor: '',
            prev_cursor: '',
        },
    }
}
