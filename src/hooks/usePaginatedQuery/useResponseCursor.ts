import {AxiosResponse, isAxiosError} from 'axios'

import {ApiListResponseCursorPagination} from 'models/api/types'

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
    if (
        isAxiosError<{
            error: {message: string; data: {cursor?: string[]}}
        }>(error)
    ) {
        if ((error?.response?.data?.error.data.cursor || []).length > 0)
            isCursorInvalid = true
    }

    return {
        previousCursor,
        nextCursor,
        isCursorInvalid,
    }
}
