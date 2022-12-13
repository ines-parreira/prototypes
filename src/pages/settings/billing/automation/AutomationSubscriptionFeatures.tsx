import React, {ReactNode} from 'react'
import classnames from 'classnames'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

import css from './AutomationSubscriptionFeatures.less'

type FeatureItem = {
    icon: string
    iconClassName?: string
    label: ReactNode
}

const OLD_FEATURES: FeatureItem[] = [
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
                Self-service features in <b>chat</b> and <b>help center</b>
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
]
const FEATURES: FeatureItem[] = [
    {
        icon: 'slow_motion_video',
        iconClassName: 'material-icons-outlined',
        label: (
            <>
                Provide shoppers with automated answers to common questions with{' '}
                <b>quick response flows</b>
            </>
        ),
    },
    {
        icon: 'low_priority',
        label: (
            <>
                Allow shoppers to manage their orders with{' '}
                <b>order management flows</b>
            </>
        ),
    },
    {
        icon: 'article',
        label: (
            <>
                Automatically answer shopper questions with help center{' '}
                <b>article recommendation</b>
            </>
        ),
    },
    {
        icon: 'insights',
        label: (
            <>
                Track shopper interactions and your automation rate with{' '}
                <b>advanced statistics</b>
            </>
        ),
    },
]

export const AutomationSubscriptionFeatures = () => {
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]

    return (
        <div
            className={classnames(
                css.features,
                isAutomationSettingsRevampEnabled
                    ? css.newFeatures
                    : css.oldFeatures
            )}
        >
            {(isAutomationSettingsRevampEnabled ? FEATURES : OLD_FEATURES).map(
                ({icon, iconClassName = 'material-icons', label}) => (
                    <li
                        key={icon}
                        className={classnames(
                            'd-flex align-items-center',
                            !isAutomationSettingsRevampEnabled &&
                                css.oldFeatureListItem
                        )}
                    >
                        <span className={classnames(css.featureIcon, 'mr-3')}>
                            <i className={iconClassName}>{icon}</i>
                        </span>
                        <span>{label}</span>
                    </li>
                )
            )}
        </div>
    )
}

export default AutomationSubscriptionFeatures
