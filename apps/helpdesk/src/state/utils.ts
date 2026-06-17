import type { AxiosError } from 'axios'

import { toast } from '@gorgias/axiom'

import type { StoreDispatch } from './types'

export const createErrorNotification = (error: unknown, reason: string) => ({
    type: 'ERROR',
    error,
    reason,
})

export const onApiError =
    (error: unknown, defaultMessage: string, action?: any) =>
    (dispatch: StoreDispatch) => {
        const message = (error as AxiosError<{ error?: { msg?: string } }>)
            ?.response?.data?.error?.msg

        action && dispatch(action)
        toast.error(message || defaultMessage)
    }
