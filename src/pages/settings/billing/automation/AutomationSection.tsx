import React, {useState} from 'react'
import classnames from 'classnames'
import {Button, Card, CardBody, CardTitle} from 'reactstrap'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'

import {
    getCurrentPlan,
    getAddOnAutomationAmountCurrentPlan,
    getHasAutomationAddOn,
} from '../../../../state/billing/selectors'
import {
    hasAutomationLegacyFeatures,
    isTrialing,
} from '../../../../state/currentAccount/selectors'
import UpgradeButton from '../../../common/components/UpgradeButton/UpgradeButton'
import SubscriptionAmount from '../../common/SubscriptionAmount'

import AutomationSubscriptionModal from './AutomationSubscriptionModal'

import css from './AutomationSection.less'

const AutomationSection = () => {
    const currentPlan = useSelector(getCurrentPlan)
    const addOnAmount = useSelector(getAddOnAutomationAmountCurrentPlan)

    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const isOnTrial = useSelector(isTrialing)
    const isSelfServeLegacy = useSelector(hasAutomationLegacyFeatures)
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)

    return (
        <Card
            className={classnames(css.card, css['automation-card'], 'col-lg-4')}
        >
            <CardTitle className={classnames(css['card-title'])}>
                Automation
                {!hasAutomationAddOn && addOnAmount != null && (
                    <SubscriptionAmount
                        className={css['automation-amount']}
                        currency={currentPlan.get('currency')}
                        interval={currentPlan.get('interval')}
                        amount={addOnAmount}
                        renderAmount={(amount) => <b>{amount}</b>}
                    />
                )}
            </CardTitle>
            <CardBody
                className={classnames(
                    css['card-body'],
                    css['automation-card-body']
                )}
            >
                <div className={css.description}>
                    {hasAutomationAddOn ? (
                        <>
                            <p>
                                You have access to{' '}
                                <b>
                                    <Link to="/app/settings/self-service">
                                        self-service
                                    </Link>
                                </b>
                                ! You can activate:
                            </p>
                            <div>
                                <ul>
                                    <li>Tracking order flows</li>
                                    <li>Custom report issue workflows</li>
                                    <li>Return & Cancellations flows</li>
                                </ul>
                            </div>
                        </>
                    ) : isSelfServeLegacy ? (
                        <p>
                            Leverage the power of <b>self-service</b> and
                            activate the new customized report issue workflows!
                        </p>
                    ) : (
                        <p>
                            Leverage the power of <b>self-service</b> to answer
                            customers <b>quickly, 24/7</b>. Activate
                            self-tracking, return & cancel order flows, and
                            custom report issue workflows!
                        </p>
                    )}
                </div>
                {hasAutomationAddOn ? (
                    <Button
                        className="align-self-end"
                        color="secondary"
                        onClick={() => {
                            setIsAutomationModalOpened(true)
                        }}
                    >
                        Manage Add-On
                    </Button>
                ) : (
                    <UpgradeButton
                        className={css['upgrade-button']}
                        label="Subscribe"
                        {...(isOnTrial
                            ? {state: {isAutomationAddOnChecked: true}}
                            : {
                                  onClick: () =>
                                      setIsAutomationModalOpened(true),
                              })}
                    />
                )}
                <AutomationSubscriptionModal
                    confirmLabel="Confirm"
                    isOpen={isAutomationModalOpened}
                    onClose={() => setIsAutomationModalOpened(false)}
                />
            </CardBody>
        </Card>
    )
}

export default AutomationSection
