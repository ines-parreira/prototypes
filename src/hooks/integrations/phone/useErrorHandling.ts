import {useEffect} from 'react'
import {dismissNotification} from 'reapop'

import refreshIcon from 'assets/img/icons/refresh.svg'
import {DEFAULT_WARNING_MESSAGE} from 'business/twilio'
import {errorMessage, isRecoverableError} from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'

import useVoiceDevice from './useVoiceDevice'

enum PhoneBannerNotification {
    Error = 'phone-error-banner',
    Warning = 'phone-warning-banner',
}

export function useErrorHandling() {
    const dispatch = useAppDispatch()
    const {error, warning, actions} = useVoiceDevice()

    useEffect(() => {
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
    }, [dispatch, error])

    useEffect(() => {
        if (warning) {
            const message = DEFAULT_WARNING_MESSAGE

            void dispatch(
                notify({
                    message,
                    status: NotificationStatus.Warning,
                    style: NotificationStyle.Banner,
                    id: PhoneBannerNotification.Warning,
                    onClick: () => {
                        actions.setWarning(null)
                    },
                })
            )
        } else {
            dispatch(dismissNotification(PhoneBannerNotification.Warning))
        }
    }, [dispatch, warning, actions])
}
