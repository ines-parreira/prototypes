import {useCallback} from 'react'

import {TwilioError} from '@twilio/voice-sdk'

import {NotificationStatus} from '../../../state/notifications/types'
import {notify} from '../../../state/notifications/actions'
import {TwilioErrorCode} from '../../../business/twilio'
import useAppDispatch from '../../useAppDispatch'

type Options = {
    ignoredErrorCodes: TwilioErrorCode[]
}

const defaultOptions: Options = {
    ignoredErrorCodes: [],
}

export function usePhoneError_DEPRECATED({
    ignoredErrorCodes,
}: Options = defaultOptions): {
    onErrorMessage: (message: string, title?: string) => void
    onError: (error: Error, title?: string) => void
    onTwilioError: (error: TwilioError.TwilioError, title?: string) => void
} {
    const dispatch = useAppDispatch()

    const onErrorMessage = useCallback(
        (message: string, title?: string) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message,
                    title,
                })
            )
        },
        [dispatch]
    )

    const onError = useCallback(
        (error: Error, title?: string) => {
            onErrorMessage(`${error.message} - ${error.name}`, title)
        },
        [onErrorMessage]
    )

    const onTwilioError = useCallback(
        (error: TwilioError.TwilioError, title?: string) => {
            if (ignoredErrorCodes.includes(error.code)) {
                return
            }

            onErrorMessage(`${error.explanation} - ${error.message}`, title)
        },
        [ignoredErrorCodes, onErrorMessage]
    )

    return {onErrorMessage, onTwilioError, onError}
}
