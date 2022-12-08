import React from 'react'
import moment from 'moment-timezone'

import {getCurrentSubscription} from 'state/currentAccount/selectors'
import {
    getCurrentHelpdeskAutomationAddonAmount,
    getHasAutomationAddOn,
    getCurrentAutomationFullAmount,
    getCurrentHelpdeskCurrency,
    getCurrentHelpdeskInterval,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'
import SubscriptionAmount from 'pages/settings/common/SubscriptionAmount'
import useAppSelector from 'hooks/useAppSelector'

import AutomationSubscriptionFeatures from './AutomationSubscriptionFeatures'

import css from './AutomationSubscriptionDescription.less'

const AutomationSubscriptionDescription = () => {
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const currentSubscriptionStart = currentSubscription.get('start_datetime')
    const isSelfServeLegacy = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )
    const addOnAmount = useAppSelector(getCurrentHelpdeskAutomationAddonAmount)
    const fullAddOnAmount = useAppSelector(getCurrentAutomationFullAmount)
    const productCurrency = useAppSelector(getCurrentHelpdeskCurrency)
    const productInterval = useAppSelector(getCurrentHelpdeskInterval)

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
                {addOnAmount != null && productInterval && (
                    <SubscriptionAmount
                        currency={productCurrency}
                        interval={productInterval}
                        amount={addOnAmount}
                        fullAmount={fullAddOnAmount}
                        renderAmount={(amount) => <b>{amount}</b>}
                        className={css.amount}
                    />
                )}
            </div>
            {!hasAutomationAddOn && <AutomationSubscriptionFeatures />}
        </div>
    )
}

export default AutomationSubscriptionDescription
