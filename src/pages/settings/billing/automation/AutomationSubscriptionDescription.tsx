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
                        Unlock advanced features of the self-service, and track
                        the performance!
                        <br />
                        Questions?{' '}
                        <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                            <b>Get in touch!</b>
                        </a>
                    </div>
                ) : (
                    <div>
                        Unlock the <b>self-service</b> features, to answer
                        customers <b>quickly, 24/7</b>!
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
                            label: (
                                <>
                                    Track, Return, Cancel & Custom{' '}
                                    <b>workflows</b>
                                </>
                            ),
                        },
                        {
                            icon: 'slow_motion_video',
                            label: (
                                <>
                                    Self-service portal in <b>chat</b> and{' '}
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
