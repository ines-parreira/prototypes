import { useEffect } from 'react'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { DEFAULT_WARNING_MESSAGE } from 'business/twilio'
import {
    errorMessage,
    isRecoverableError,
} from 'hooks/integrations/phone/utils'
import type { VoiceDeviceActions } from 'pages/integrations/integration/components/voice/types'
import type { State } from 'state/twilio/voiceDevice'

enum PhoneAlertBanner {
    Error = 'phone-error-banner',
    Warning = 'phone-warning-banner',
}

export function useErrorHandling(state: State, actions: VoiceDeviceActions) {
    const { error, warning } = state
    const { addBanner, removeBanner } = useBanners()

    useEffect(() => {
        if (error && !isRecoverableError(error)) {
            addBanner({
                message: errorMessage(error),
                type: AlertBannerTypes.Critical,
                instanceId: PhoneAlertBanner.Error,
                category: BannerCategories.ERROR_HANDLING,
                CTA: {
                    type: 'action',
                    text: 'Reload page',
                    onClick: () => window.location.reload(),
                },
            })
        } else {
            removeBanner(
                BannerCategories.ERROR_HANDLING,
                PhoneAlertBanner.Error,
            )
        }
    }, [addBanner, error, removeBanner])

    useEffect(() => {
        if (warning) {
            const message = DEFAULT_WARNING_MESSAGE

            addBanner({
                message,
                type: AlertBannerTypes.Warning,
                instanceId: PhoneAlertBanner.Warning,
                category: BannerCategories.ERROR_HANDLING,
                onClose: () => {
                    actions.setWarning(null)
                },
            })
        } else {
            removeBanner(
                BannerCategories.ERROR_HANDLING,
                PhoneAlertBanner.Warning,
            )
        }
    }, [warning, actions, addBanner, removeBanner])
}
