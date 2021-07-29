import React from 'react'
import {Link} from 'react-router-dom'

import {openChat} from '../../../utils'

import css from './LegacyPlanBanner.less'

type Props = {
    isCustomPlan?: boolean
}

export function LegacyPlanBanner({isCustomPlan = false}: Props) {
    return (
        <div className={css.legacyExpirationBanner}>
            <i className="material-icons">error</i>
            <div className={css.legacyExpirationBannerLabel}>
                {`You are subscribed to a legacy plan. New features are only
                available on our new plans.${
                    !isCustomPlan
                        ? ' Reach out to our support team with any questions.'
                        : ''
                }`}{' '}
                {!isCustomPlan ? (
                    <Link to="/app/settings/billing/plans">
                        <span className={css.plansLink}>
                            See all new plans.
                        </span>
                    </Link>
                ) : (
                    <a href="" onClick={() => openChat}>
                        Reach out to support
                    </a>
                )}
            </div>
        </div>
    )
}

export default LegacyPlanBanner
