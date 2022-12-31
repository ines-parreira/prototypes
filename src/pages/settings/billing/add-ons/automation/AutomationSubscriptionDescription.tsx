import React from 'react'
import moment from 'moment-timezone'
import classnames from 'classnames'

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
            {!hasAutomationAddOn && !isSelfServeLegacy && (
                <div className={css.badge}>
                    <i className={classnames(css.icon, 'material-icons')}>
                        auto_awesome
                    </i>
                    <span>
                        Access these features and more with the Automation
                        Add-on!
                    </span>
                </div>
            )}
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
                        Add advanced automation features and automate up to 20%
                        of all interactions.
                        <br />
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://app.livestorm.co/gorgias-1/automaton-add-on-workshop?utm_source=candu&amp;utm_medium=in_product&amp;utm_campaign=homepage_addon"
                        >
                            Learn more.
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
