import React from 'react'
import {useSelector} from 'react-redux'
import moment from 'moment-timezone'
import classnames from 'classnames'

import {
    getCurrentSubscription,
    hasAutomationLegacyFeatures,
} from '../../../../state/currentAccount/selectors'
import {
    getAddOnAutomationAmountCurrentPlan,
    getCurrentPlan,
    getHasAutomationAddOn,
} from '../../../../state/billing/selectors'
import SubscriptionAmount from '../../common/SubscriptionAmount'
import PlanFeatureMaterialIcon from '../plans/PlanFeatureMaterialIcon'

import css from './AutomationSubscriptionDescription.less'

const AutomationSubscriptionDescription = () => {
    const currentSubscription = useSelector(getCurrentSubscription)
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)
    const currentPlan = useSelector(getCurrentPlan)
    const currentSubscriptionStart = currentSubscription.get('start_datetime')
    const isSelfServeLegacy = useSelector(hasAutomationLegacyFeatures)
    const addOnAmount = useSelector(getAddOnAutomationAmountCurrentPlan)

    return (
        <div className={css.description}>
            <div className="flex">
                {hasAutomationAddOn ? (
                    <div>
                        Your current subscription started on{' '}
                        <b>
                            {moment(currentSubscriptionStart).format('MMM DD')}
                        </b>
                        .
                        <br />
                        <br />
                        If you cancel now, you will loose access to self-service{' '}
                        {isSelfServeLegacy && 'custom report issue flow '}
                        immediately.
                    </div>
                ) : isSelfServeLegacy ? (
                    <div>
                        Activate <b>the new custom report issue workflow</b> for
                        self-service!
                        <br />
                        Questions?{' '}
                        <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                            <b>Get in touch!</b>
                        </a>
                    </div>
                ) : (
                    <div>
                        Unlock the <b>self-service</b> features, to answer
                        customers <b>quickly, 24/7!</b>
                        <br />
                        Questions?{' '}
                        <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                            <b>Get in touch!</b>
                        </a>
                    </div>
                )}
                {addOnAmount != null && (
                    <SubscriptionAmount
                        currency={currentPlan.get('currency')}
                        interval={currentPlan.get('interval')}
                        amount={addOnAmount}
                        renderAmount={(amount) => <b>{amount}</b>}
                        className={css.amount}
                    />
                )}
            </div>
            {!hasAutomationAddOn && (
                <div className={css.features}>
                    {[
                        {
                            icon: 'low_priority',
                            label: 'Tracking, Return & Cancellation flows',
                        },
                        {
                            icon: 'slow_motion_video',
                            label: 'Custom report issue flows',
                        },
                    ].map(({icon, label}) => (
                        <li
                            key={label}
                            className={classnames(
                                'd-flex align-items-center',
                                css.featureListItem
                            )}
                        >
                            <span
                                className={classnames(css.featureIcon, 'mr-3')}
                            >
                                <PlanFeatureMaterialIcon icon={icon} />
                            </span>
                            <span>{label}</span>
                        </li>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AutomationSubscriptionDescription
