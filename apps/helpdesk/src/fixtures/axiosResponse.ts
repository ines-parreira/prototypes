import type { AxiosResponse } from 'axios'
import { AxiosHeaders } from 'axios'

import type { CursorPaginationMeta } from '@gorgias/helpdesk-queries'

import type { ApiListResponseCursorPagination } from 'models/api/types'

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
    meta: CursorPaginationMeta = {
        next_cursor: '',
        prev_cursor: '',
        total_resources: null,
    },
): ApiListResponseCursorPagination<D> {
    return {
        data,
        uri: '',
        object: '',
        meta: meta,
    }
}
