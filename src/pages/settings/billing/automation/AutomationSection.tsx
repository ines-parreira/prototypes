import React, {useState} from 'react'
import classnames from 'classnames'
import {Card, CardBody, CardTitle} from 'reactstrap'
import {Link} from 'react-router-dom'

import {
    getCurrentHelpdeskAutomationAddonAmount,
    getCurrentAutomationFullAmount,
    getHasAutomationAddOn,
    getCurrentHelpdeskCurrency,
    getCurrentHelpdeskInterval,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'
import SubscriptionAmount from 'pages/settings/common/SubscriptionAmount'
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'
import AutomationSubscriptionButton from 'pages/settings/billing/automation/AutomationSubscriptionButton'

import AutomationSubscriptionModal from './AutomationSubscriptionModal'
import css from './AutomationSection.less'

const AutomationSection = () => {
    const currency = useAppSelector(getCurrentHelpdeskCurrency)
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const addOnAmount = useAppSelector(getCurrentHelpdeskAutomationAddonAmount)
    const fullAddOnAmount = useAppSelector(getCurrentAutomationFullAmount)

    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const isSelfServeLegacy = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    return (
        <Card
            className={classnames(css.card, css['automation-card'], 'col-lg-4')}
        >
            <CardTitle className={classnames(css['card-title'])}>
                Automation
                {!hasAutomationAddOn && addOnAmount != null && interval && (
                    <SubscriptionAmount
                        className={css['automation-amount']}
                        currency={currency}
                        interval={interval}
                        amount={addOnAmount}
                        fullAmount={fullAddOnAmount}
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
                            <p className="mb0">
                                You have access to the automation-addon,
                                including:
                            </p>
                            <div>
                                <ul>
                                    <li>
                                        <Link to="/app/settings/self-service">
                                            <b>Self-service</b>
                                        </Link>{' '}
                                        in <b>chat</b> and in <b>help center</b>
                                    </li>
                                    <li>
                                        <b>Track</b>, <b>Return</b> &{' '}
                                        <b>Cancel</b> order flows
                                    </li>
                                    <li>
                                        <b>Customized</b> report issue workflows
                                    </li>
                                    <li>
                                        Dedicated self-service{' '}
                                        <Link to="/app/stats/self-service">
                                            <b>report </b>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </>
                    ) : isSelfServeLegacy ? (
                        <p>
                            Leverage the power of the{' '}
                            <b>advanced self-service features</b> like
                            customized report issue flow and self-service
                            integrated in help center!
                            <br />
                            <b>Track</b> your customers’ requests and see{' '}
                            <b>how many you automate</b>.
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
                        intent="secondary"
                        onClick={() => {
                            setIsAutomationModalOpened(true)
                        }}
                    >
                        Manage add-on
                    </Button>
                ) : (
                    <AutomationSubscriptionButton
                        className={css['upgrade-button']}
                        label="Subscribe"
                        onClick={() => setIsAutomationModalOpened(true)}
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
