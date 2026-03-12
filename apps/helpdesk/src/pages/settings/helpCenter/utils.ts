import type { AxiosError } from 'axios'
import { isAxiosError } from 'axios'

export const getGenericMessageFromError = (err: unknown) => {
    if (isAxiosError(err) && err.response?.status === 400) {
        return isHelpCenterApiError(err)
            ? err.response.data.message
            : 'some fields are empty or invalid.'
    }
    return 'please try again later.'
}

const isHelpCenterApiError = (
    error: AxiosError,
): error is AxiosError<{ message: string }> => {
    const data = error.response?.data
    return (
        'message' in (data as { message: unknown }) &&
        typeof (data as Record<string, unknown>).message === 'string'
    )
}
