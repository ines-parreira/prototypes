import {AxiosHeaders, AxiosResponse} from 'axios'
import {ApiListResponseCursorPagination} from 'models/api/types'

export function axiosSuccessResponse<D>(data: D): AxiosResponse<D> {
    return {
        data,
        status: 200,
        statusText: 'OK',
        config: {
            headers: new AxiosHeaders(),
        },
        headers: {},
    }
}

export function apiListCursorPaginationResponse<D>(
    data: D,
    meta: {
        next_cursor: string
        prev_cursor: string
    } = {next_cursor: '', prev_cursor: ''}
): ApiListResponseCursorPagination<D> {
    return {
        data,
        uri: '',
        object: '',
        meta: meta,
    }
}
