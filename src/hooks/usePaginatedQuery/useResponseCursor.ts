import {AxiosResponse} from 'axios'

import {
    ApiListResponseCursorPagination,
    isGorgiasApiError,
} from 'models/api/types'

export const useResponseCursor = ({
    data,
    error,
}: {
    data: AxiosResponse<ApiListResponseCursorPagination<unknown>> | undefined
    error: unknown
}) => {
    const metaData = data?.data?.meta
    const previousCursor = metaData?.prev_cursor || ''
    const nextCursor = metaData?.next_cursor || ''

    let isCursorInvalid = false
    if (isGorgiasApiError(error)) {
        const {data} = error.response.data.error
        if (data && typeof data === 'object' && 'cursor' in data) {
            const {cursor} = data as {cursor?: unknown}
            if (Array.isArray(cursor) && cursor.length) {
                isCursorInvalid = true
            }
        }
    }

    return {
        previousCursor,
        nextCursor,
        isCursorInvalid,
    }
}
