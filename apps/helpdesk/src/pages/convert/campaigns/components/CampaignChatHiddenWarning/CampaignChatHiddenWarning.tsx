import React, { useMemo } from 'react'

import { useDismissFlag } from '@repo/hooks'
import type { Map } from 'immutable'
import { Link } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { isAccountDuringBusinessHours } from 'state/integrations/helpers'

type Props = {
    integration: Map<any, any>
}

export const CampaignChatHiddenWarning = ({ integration }: Props) => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const businessHours = useAppSelector(getBusinessHoursSettings)
    const { isDismissed, dismiss } = useDismissFlag(
        'gorgias.chat-hidden-warning',
        true,
    )
    const isDuringBusinessHours = isAccountDuringBusinessHours(businessHours)

    const isDisplayCampaignsWhenChatIsHiddenEnabled: boolean =
        integration.getIn(
            ['meta', 'preferences', 'display_campaigns_hidden_chat'],
            false,
        )
    const isHideOutsideBusinessHoursEnabled: boolean = integration.getIn(
        ['meta', 'preferences', 'hide_outside_business_hours'],
        false,
    )

    const isOfflineModeEnabled: boolean =
        integration.getIn(['deactivated_datetime'], null) !== null

    const shouldDisplayWarning = useMemo(() => {
        if (isDisplayCampaignsWhenChatIsHiddenEnabled) {
            if (isOfflineModeEnabled) {
                return true
            }

            if (!isDuringBusinessHours) {
                return isHideOutsideBusinessHoursEnabled
            }
        }

        return false
    }, [
        isDisplayCampaignsWhenChatIsHiddenEnabled,
        isDuringBusinessHours,
        isHideOutsideBusinessHoursEnabled,
        isOfflineModeEnabled,
    ])

    if (!isConvertSubscriber || !shouldDisplayWarning || isDismissed)
        return <></>

    return (
        <Alert
            className="mt-4"
            customActions={
                <Link
                    to={
                        `/app/settings/channels/${IntegrationType.GorgiasChat}/` +
                        `${integration.get('id') as string}/preferences`
                    }
                >
                    Go to preferences
                </Link>
            }
            type={AlertType.Warning}
            onClose={dismiss}
        >
            Chat is currently hidden. Campaigns are still displayed, but they
            will not be interactive. You can change this in the Preferences tab.
        </Alert>
    )
}
