import React from 'react'
import classnames from 'classnames'

import PlanFeatureMaterialIcon from '../plans/PlanFeatureMaterialIcon'

import css from './AutomationSubscriptionFeatures.less'

export const AutomationSubscriptionFeatures = () => {
    return (
        <div className={css.features}>
            {[
                {
                    icon: 'low_priority',
                    label: (
                        <>
                            Track, Return, Cancel & Custom <b>workflows</b>
                        </>
                    ),
                },
                {
                    icon: 'slow_motion_video',
                    label: (
                        <>
                            Self-service features in <b>chat</b> and{' '}
                            <b>help center</b>
                        </>
                    ),
                },
                {
                    icon: 'insights',
                    label: (
                        <>
                            Self-service <b>statistics</b>
                        </>
                    ),
                },
            ].map(({icon, label}) => (
                <li
                    key={icon}
                    className={classnames(
                        'd-flex align-items-center',
                        css.featureListItem
                    )}
                >
                    <span className={classnames(css.featureIcon, 'mr-3')}>
                        <PlanFeatureMaterialIcon icon={icon} />
                    </span>
                    <span>{label}</span>
                </li>
            ))}
        </div>
    )
}

export default AutomationSubscriptionFeatures
