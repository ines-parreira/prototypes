import React from 'react'
import moment from 'moment-timezone'

import {
    getCurrentSubscription,
    hasAutomationLegacyFeatures,
} from 'state/currentAccount/selectors'
import {
    getAddOnAutomationAmountCurrentPlan,
    DEPRECATED_getCurrentPlan,
    getHasAutomationAddOn,
} from 'state/billing/selectors'
import SubscriptionAmount from 'pages/settings/common/SubscriptionAmount'
import useAppSelector from 'hooks/useAppSelector'

import AutomationSubscriptionFeatures from './AutomationSubscriptionFeatures'

import css from './AutomationSubscriptionDescription.less'

const AutomationSubscriptionDescription = () => {
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const currentPlan = useAppSelector(DEPRECATED_getCurrentPlan)
    const currentSubscriptionStart = currentSubscription.get('start_datetime')
    const isSelfServeLegacy = useAppSelector(hasAutomationLegacyFeatures)
    const addOnAmount = useAppSelector(getAddOnAutomationAmountCurrentPlan)

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
                        If you cancel now, you will lose access to self-service{' '}
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
                        discountedAmount={addOnAmount * 2}
                        renderAmount={(amount) => <b>{amount}</b>}
                        className={css.amount}
                        tooltipContent={
                            <span>
                                Act now and get early access savings on the
                                automation add-on <i>(limited time offer)</i>
                            </span>
                        }
                    />
                )}
            </div>
            {!hasAutomationAddOn && <AutomationSubscriptionFeatures />}
        </div>
    )
}

export default AutomationSubscriptionDescription
