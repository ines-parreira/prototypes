import React from 'react'
import {Link} from 'react-router-dom'

import css from './LegacyPlanBanner.less'

export function LegacyPlanBanner() {
    return (
        <div className={css.legacyExpirationBanner}>
            <i className="material-icons">error</i>
            <div className={css.legacyExpirationBannerLabel}>
                You are subscribed to a legacy plan. New features are only
                available on our new plans. Reach out to our support team with
                any questions.{' '}
                <Link to="/app/settings/billing/plans">
                    <span className={css.plansLink}>See all new plans.</span>
                </Link>
            </div>
        </div>
    )
}

export default LegacyPlanBanner
