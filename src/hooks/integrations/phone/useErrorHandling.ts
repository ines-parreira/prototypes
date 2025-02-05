import {useEffect} from 'react'
import {dismissNotification} from 'reapop'

import {AlertBannerTypes} from 'AlertBanners'
import {DEFAULT_WARNING_MESSAGE} from 'business/twilio'
import {errorMessage, isRecoverableError} from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import {VoiceDeviceActions} from 'pages/integrations/integration/components/voice/types'
import {notify} from 'state/notifications/actions'
import {NotificationStyle} from 'state/notifications/types'

import {State} from 'state/twilio/voiceDevice'

enum PhoneAlertBanner {
    Error = 'phone-error-banner',
    Warning = 'phone-warning-banner',
}

export function useErrorHandling(state: State, actions: VoiceDeviceActions) {
    const dispatch = useAppDispatch()
    const {error, warning} = state

    useEffect(() => {
        if (error && !isRecoverableError(error)) {
            void dispatch(
                notify({
                    message: errorMessage(error),
                    type: AlertBannerTypes.Critical,
                    style: NotificationStyle.Banner,
                    id: PhoneAlertBanner.Error,
                    CTA: {
                        type: 'action',
                        text: 'Reload page',
                        onClick: () => window.location.reload(),
                    },
                })
            )
        } else {
            dispatch(dismissNotification(PhoneAlertBanner.Error))
        }
    }, [dispatch, error])

    useEffect(() => {
        if (warning) {
            const message = DEFAULT_WARNING_MESSAGE

            void dispatch(
                notify({
                    message,
                    type: AlertBannerTypes.Warning,
                    style: NotificationStyle.Banner,
                    id: PhoneAlertBanner.Warning,
                    onClose: () => {
                        actions.setWarning(null)
                    },
                })
            )
        } else {
            dispatch(dismissNotification(PhoneAlertBanner.Warning))
        }
    }, [dispatch, warning, actions])
}
