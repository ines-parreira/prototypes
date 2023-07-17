import React from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {openChat} from '../../../utils'

import css from './LegacyPlanBanner.less'
import LinkAlert from './Alert/LinkAlert'
import {AlertType} from './Alert/Alert'

type Props = {
    isCustomPrice?: boolean
}

export function LegacyPlanBanner({isCustomPrice = false}: Props) {
    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]

    return (
        <LinkAlert
            type={AlertType.Error}
            actionLabel={
                !isCustomPrice ? 'See all new plans.' : 'Reach out to support'
            }
            actionHref={
                !isCustomPrice
                    ? hasAccessToNewBilling
                        ? '/app/settings/billing'
                        : '/app/settings/billing/plans'
                    : undefined
            }
            onAction={isCustomPrice ? openChat : undefined}
            icon
            className={css.legacyExpirationAlert}
        >
            {`You are subscribed to a legacy plan. New features are only
                available on our new plans.${
                    !isCustomPrice
                        ? ' Reach out to our support team with any questions.'
                        : ''
                }`}
        </LinkAlert>
    )
}

export default LegacyPlanBanner
