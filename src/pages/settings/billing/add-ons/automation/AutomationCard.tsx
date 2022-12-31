import React, {useState} from 'react'
import {Card, CardBody, CardTitle} from 'reactstrap'
import classnames from 'classnames'

import {
    getCurrentHelpdeskAutomationAddonAmount,
    getCurrentAutomationFullAmount,
    getHasAutomationAddOn,
    getCurrentHelpdeskCurrency,
    getCurrentHelpdeskInterval,
    getHasLegacyAutomationAddOnFeatures,
    getCurrentHelpdeskName,
} from 'state/billing/selectors'
import SubscriptionAmount from 'pages/settings/common/SubscriptionAmount'
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'
import AutomationSubscriptionButton from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionButton'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'

import css from '../AddOnCard.less'

import AutomationSubscriptionModal from './AutomationSubscriptionModal'

type Props = {
    className?: string
}

const AutomationCard = ({className}: Props) => {
    const currency = useAppSelector(getCurrentHelpdeskCurrency)
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const addOnAmount = useAppSelector(getCurrentHelpdeskAutomationAddonAmount)
    const fullAddOnAmount = useAppSelector(getCurrentAutomationFullAmount)
    const priceName = useAppSelector(getCurrentHelpdeskName)
    const formattedPriceName = convertLegacyPlanNameToPublicPlanName(
        priceName || ''
    )

    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const isSelfServeLegacy = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    return (
        <Card className={className}>
            <CardTitle
                className={classnames(css['card-title'], {
                    [css[formattedPriceName.toLowerCase()]]: hasAutomationAddOn,
                })}
            >
                <span className={css.title}>Automation</span>
                {!hasAutomationAddOn && addOnAmount != null && interval && (
                    <SubscriptionAmount
                        className={css['subscription-amount']}
                        currency={currency}
                        interval={interval}
                        amount={addOnAmount}
                        fullAmount={fullAddOnAmount}
                        renderAmount={(amount) => <b>{amount}</b>}
                    />
                )}
            </CardTitle>
            <CardBody className={css['card-body']}>
                <div className={css.description}>
                    {hasAutomationAddOn ? (
                        <>
                            <p className="mb0">
                                <b>You have access to:</b>
                            </p>
                            <div>
                                <ul>
                                    <li>Quick response flows in chat</li>
                                    <li>
                                        Order management flows in chat and help
                                        center
                                    </li>
                                    <li>Help center article recommendation</li>
                                    <li>Advanced automation statistics</li>
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
                            Automate up to 20% of all interactions with quick
                            response flows, order management flows, article
                            recommendation, and advanced statistics.
                        </p>
                    )}
                </div>
                <div className={css.footer}>
                    {hasAutomationAddOn ? (
                        <Button
                            className={css.button}
                            intent="secondary"
                            onClick={() => {
                                setIsAutomationModalOpened(true)
                            }}
                        >
                            Manage add-on
                        </Button>
                    ) : (
                        <>
                            <a
                                href="https://docs.gorgias.com/en-US/automation-add-on-overview-81855#pricing"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View pricing details
                            </a>
                            <AutomationSubscriptionButton
                                className={css.button}
                                intent="secondary"
                                label="Subscribe"
                                onClick={() => setIsAutomationModalOpened(true)}
                                hasIcon={false}
                            />
                        </>
                    )}
                </div>
                <AutomationSubscriptionModal
                    confirmLabel="Confirm"
                    isOpen={isAutomationModalOpened}
                    onClose={() => setIsAutomationModalOpened(false)}
                />
            </CardBody>
        </Card>
    )
}

export default AutomationCard
