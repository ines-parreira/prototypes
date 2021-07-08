import {AxiosError} from 'axios'

export const createErrorNotification = (error: AxiosError, reason: string) => ({
    type: 'ERROR',
    error,
    reason,
})
