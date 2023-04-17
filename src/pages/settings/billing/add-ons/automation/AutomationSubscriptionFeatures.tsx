import React, {ReactNode} from 'react'
import classnames from 'classnames'

import css from './AutomationSubscriptionFeatures.less'

type FeatureItem = {
    icon: string
    iconClassName?: string
    label: ReactNode
}

const FEATURES: FeatureItem[] = [
    {
        icon: 'slow_motion_video',
        iconClassName: 'material-icons-outlined',
        label: (
            <>
                Provide customers with automated answers to common questions
                with <b>quick response flows</b>
            </>
        ),
    },
    {
        icon: 'low_priority',
        label: (
            <>
                Allow customers to manage their orders with{' '}
                <b>order management flows</b>
            </>
        ),
    },
    {
        icon: 'article',
        label: (
            <>
                Automatically answer customer questions with help center{' '}
                <b>article recommendation</b>
            </>
        ),
    },
    {
        icon: 'insights',
        label: (
            <>
                Track customer interactions and your automation rate with{' '}
                <b>advanced statistics</b>
            </>
        ),
    },
]

export const AutomationSubscriptionFeatures = () => {
    return (
        <div className={css.features}>
            {FEATURES.map(({icon, iconClassName = 'material-icons', label}) => (
                <li key={icon} className="d-flex align-items-center">
                    <span className={classnames(css.featureIcon, 'mr-3')}>
                        <i className={iconClassName}>{icon}</i>
                    </span>
                    <span>{label}</span>
                </li>
            ))}
        </div>
    )
}

export default AutomationSubscriptionFeatures
