import {useEffect} from 'react'
import {dismissNotification} from 'reapop'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {setWarning} from 'state/twilio/actions'
import {notify} from 'state/notifications/actions'
import {DEFAULT_WARNING_MESSAGE} from 'business/twilio'
import {errorMessage, isRecoverableError} from 'hooks/integrations/phone/utils'

import refreshIcon from 'assets/img/icons/refresh.svg'
import {FeatureFlagKey} from 'config/featureFlags'

enum PhoneBannerNotification {
    Error = 'phone-error-banner',
    Warning = 'phone-warning-banner',
}

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
            const message = DEFAULT_WARNING_MESSAGE

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
