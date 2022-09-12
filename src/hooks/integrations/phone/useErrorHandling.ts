import {useEffect} from 'react'
import {dismissNotification} from 'reapop'
import {TwilioError} from '@twilio/voice-sdk'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {setWarning} from 'state/twilio/actions'
import {notify} from 'state/notifications/actions'
import {TwilioErrorCode} from 'business/twilio'

import refreshIcon from 'assets/img/icons/refresh.svg'
import {FeatureFlagKey} from 'config/featureFlags'

enum PhoneBannerNotification {
    Error = 'phone-error-banner',
    Warning = 'phone-warning-banner',
}

const DEFAULT_ERROR_MESSAGE =
    'Failed to initialize the phone integration. If the problem persists, please contact support.'

export function useErrorHandling() {
    const dispatch = useAppDispatch()
    const {error, warning} = useAppSelector((state) => state.twilio)
    const useNewErrorHandling = useFlags()[FeatureFlagKey.NewPhoneErrorHandling]

    useEffect(() => {
        if (!useNewErrorHandling) {
            return
        }

        if (error && !isRecoverableError(error)) {
            void dispatch(
                notify({
                    message: errorMessage(error),
                    status: NotificationStatus.Error,
                    style: NotificationStyle.Banner,
                    id: PhoneBannerNotification.Error,
                    actionHTML: `<span class="d-inline-flex align-items-baseline">
                    <img src=${refreshIcon} class="align-self-center" style="margin-right: 8px"/>
                    <span class="text-primary">Reload page</span>
                    </span>`,
                    showIcon: true,
                    onClick: () => window.location.reload(),
                    dismissible: false,
                    allowHTML: true,
                })
            )
        } else {
            dispatch(dismissNotification(PhoneBannerNotification.Error))
        }
    }, [dispatch, error, useNewErrorHandling])

    useEffect(() => {
        if (!useNewErrorHandling) {
            return
        }

        if (warning) {
            const message =
                'Poor network connection detected. Phone calls cannot be properly received or made until connection improves. Try restarting the network on your device.'
            void dispatch(
                notify({
                    message,
                    status: NotificationStatus.Warning,
                    style: NotificationStyle.Banner,
                    id: PhoneBannerNotification.Warning,
                    onClick: () => {
                        dispatch(setWarning(null))
                    },
                })
            )
        } else {
            dispatch(dismissNotification(PhoneBannerNotification.Warning))
        }
    }, [dispatch, warning, useNewErrorHandling])
}

function errorMessage(error: Error): string {
    if (error instanceof TwilioError.TwilioError) {
        switch (error.code) {
            case 31401:
                return 'Microphone access has not been granted.'
            default:
                return DEFAULT_ERROR_MESSAGE
        }
    }

    return DEFAULT_ERROR_MESSAGE
}

function isRecoverableError(error: Error): boolean {
    if (error instanceof TwilioError.TwilioError) {
        return [
            TwilioErrorCode.GeneralTransport,
            TwilioErrorCode.GeneralConnection,
        ].includes(error?.code)
    }

    return false
}
