import axios, {AxiosError} from 'axios'

export const getGenericMessageFromError = (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
        return isHelpCenterApiError(err)
            ? err.response.data.message
            : 'some fields are empty or invalid.'
    }
    return 'please try again later.'
}

const isHelpCenterApiError = (
    error: AxiosError
): error is AxiosError<{message: string}> => {
    const data = error.response?.data
    return (
        'message' in data &&
        typeof (data as Record<string, unknown>).message === 'string'
    )
}
