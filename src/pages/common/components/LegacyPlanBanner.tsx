import React from 'react'

import {openChat} from '../../../utils'

import css from './LegacyPlanBanner.less'
import LinkAlert from './Alert/LinkAlert'
import {AlertType} from './Alert/Alert'

type Props = {
    isCustomPlan?: boolean
}

export function LegacyPlanBanner({isCustomPlan = false}: Props) {
    return (
        <LinkAlert
            type={AlertType.Error}
            actionLabel={
                !isCustomPlan ? 'See all new plans.' : 'Reach out to support'
            }
            actionHref={
                !isCustomPlan ? '/app/settings/billing/plans' : undefined
            }
            onAction={isCustomPlan ? openChat : undefined}
            icon
            className={css.legacyExpirationAlert}
        >
            {`You are subscribed to a legacy plan. New features are only
                available on our new plans.${
                    !isCustomPlan
                        ? ' Reach out to our support team with any questions.'
                        : ''
                }`}
        </LinkAlert>
    )
}

export default LegacyPlanBanner
