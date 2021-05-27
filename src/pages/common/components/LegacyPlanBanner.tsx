import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'

import {getEndSubscriptionPeriodLabel} from '../../../state/billing/selectors'
import {RootState} from '../../../state/types'

import css from './LegacyPlanBanner.less'

type Props = ConnectedProps<typeof connector>

export function LegacyPlanBanner({subscriptionEnd}: Props) {
    return (
        <div className={css.legacyExpirationBanner}>
            <i className="material-icons">error</i>
            <div className={css.legacyExpirationBannerLabel}>
                You are subscribed to a legacy plan that expires
                {subscriptionEnd ? (
                    <>
                        {' '}
                        on{' '}
                        <span className={css.expirationDate}>
                            {subscriptionEnd}
                        </span>
                    </>
                ) : (
                    <span className={css.expirationDate}>soon</span>
                )}
                .{' '}
                <Link to="/app/settings/billing/plans">
                    <span className={css.plansLink}>See all new plans.</span>
                </Link>
            </div>
        </div>
    )
}

const connector = connect((state: RootState) => {
    return {
        subscriptionEnd: getEndSubscriptionPeriodLabel(state),
    }
}, {})

export default connector(LegacyPlanBanner)
