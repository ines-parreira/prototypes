import React from 'react'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useId from 'hooks/useId'
import {PlanInterval} from 'models/billing/types'
import Tooltip from 'pages/common/components/Tooltip'
import CheckBox from 'pages/common/forms/CheckBox'
import SubscriptionAmount from 'pages/settings/common/SubscriptionAmount'
import {FeatureFlagKey} from 'config/featureFlags'

import css from './AutomationAmount.less'

const AutomationLabel = ({id}: {id: string}) => {
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]
    return (
        <div className={classnames('align-middle', css.checkboxLabel)}>
            <span id={`automation-text-${id}`}>
                {isAutomationSettingsRevampEnabled
                    ? 'Automation Add-on'
                    : 'Automation'}
            </span>
        </div>
    )
}

type Props = {
    addOnAmount?: number | string
    currency?: string
    fullAddOnAmount?: number
    interval?: PlanInterval
    isAutomationChecked?: boolean
    onAutomationChange?: () => void
    editable?: boolean
    isIntervalAbbreviated?: boolean
}

const AutomationAmount = ({
    addOnAmount,
    currency,
    fullAddOnAmount,
    interval,
    isAutomationChecked,
    onAutomationChange,
    editable = true,
    isIntervalAbbreviated = false,
}: Props) => {
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]
    const checkboxId = useId()

    return (
        <>
            {editable ? (
                <div className={css.automationRow}>
                    {typeof addOnAmount === 'number' ? (
                        <CheckBox
                            className={css.checkbox}
                            name={checkboxId}
                            isChecked={isAutomationChecked}
                            {...(!!onAutomationChange
                                ? {onChange: onAutomationChange}
                                : {readOnly: true})}
                        >
                            <AutomationLabel id={checkboxId} />
                        </CheckBox>
                    ) : (
                        <AutomationLabel id={checkboxId} />
                    )}
                    <div className={css.amountContainer}>
                        {typeof addOnAmount === 'number' &&
                        currency &&
                        interval ? (
                            <SubscriptionAmount
                                amount={addOnAmount}
                                fullAmount={fullAddOnAmount}
                                className={classnames(css.amount, {
                                    [css.amountDisabled]: !isAutomationChecked,
                                })}
                                currency={currency}
                                interval={interval}
                                renderAmount={(amount) => <b>{amount}</b>}
                                isIntervalAbbreviated={isIntervalAbbreviated}
                            />
                        ) : (
                            <i>{addOnAmount || 'Unavailable'}</i>
                        )}
                    </div>
                    <Tooltip
                        target={`automation-text-${checkboxId}`}
                        placement="top-start"
                        innerClassName={css.tooltip}
                        fade={false}
                        autohide={false}
                    >
                        {isAutomationSettingsRevampEnabled ? (
                            'Automate up to 20% of all interactions with quick response flows, order management flows, article recommendation, and advanced statistics.'
                        ) : (
                            <>
                                Leverage self-service to provide instant answers
                                in Gorgias Chat and Help Center, 24/7:
                                <ul>
                                    <li>Automated track flow</li>
                                    <li>Return & cancel flows</li>
                                    <li>Customized report issue workflows</li>
                                    <li>Self-service statistics</li>
                                </ul>
                            </>
                        )}
                    </Tooltip>
                </div>
            ) : (
                <div className={css.automationRow}>
                    <div
                        className={classnames(
                            'align-middle',
                            css.checkboxLabel
                        )}
                    >
                        {isAutomationSettingsRevampEnabled
                            ? 'Automation Add-on'
                            : 'Automation'}
                    </div>
                    <div className={css.amountContainer}>
                        {typeof addOnAmount === 'number' &&
                        currency &&
                        interval ? (
                            <SubscriptionAmount
                                amount={addOnAmount}
                                fullAmount={fullAddOnAmount}
                                className={classnames(css.amount)}
                                currency={currency}
                                interval={interval}
                                renderAmount={(amount) => <b>{amount}</b>}
                                isIntervalAbbreviated={isIntervalAbbreviated}
                            />
                        ) : (
                            <i>{addOnAmount || 'Unavailable'}</i>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default AutomationAmount
