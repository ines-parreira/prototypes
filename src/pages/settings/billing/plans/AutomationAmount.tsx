import React, {useMemo} from 'react'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'

import {Plan} from 'models/billing/types'
import Tooltip from 'pages/common/components/Tooltip'
import CheckBox from 'pages/common/forms/CheckBox'
import SubscriptionAmount from '../../common/SubscriptionAmount'

import css from './AutomationAmount.less'

const AutomationLabel = ({id}: {id: string}) => (
    <div className={classnames('align-middle', css.checkboxLabel)}>
        <span id={`automation-text-${id}`}>Automation</span>
    </div>
)

type Props = {
    addOnAmount?: number | string
    isAutomationChecked?: boolean
    onAutomationChange?: () => void
    plan: Partial<Pick<Plan, 'amount' | 'currency' | 'id' | 'interval'>>
    editable?: boolean
    isIntervalAbbreviated?: boolean
}

const AutomationAmount = ({
    addOnAmount,
    isAutomationChecked,
    onAutomationChange,
    plan,
    editable = true,
    isIntervalAbbreviated = false,
}: Props) => {
    const id = useMemo(() => _uniqueId(plan.id), [])

    return (
        <>
            {editable ? (
                <div className={css.automationRow}>
                    {typeof addOnAmount === 'number' ? (
                        <CheckBox
                            className={css.checkbox}
                            name={id}
                            isChecked={isAutomationChecked}
                            {...(!!onAutomationChange
                                ? {onChange: onAutomationChange}
                                : {readOnly: true})}
                        >
                            <AutomationLabel id={id} />
                        </CheckBox>
                    ) : (
                        <AutomationLabel id={id} />
                    )}
                    <div className={css.amountContainer}>
                        {typeof addOnAmount === 'number' &&
                        plan.currency &&
                        plan.interval ? (
                            <SubscriptionAmount
                                amount={addOnAmount}
                                discountedAmount={addOnAmount * 2}
                                className={classnames(css.amount, {
                                    [css.amountDisabled]: !isAutomationChecked,
                                })}
                                currency={plan.currency}
                                interval={plan.interval}
                                renderAmount={(amount) => <b>{amount}</b>}
                                tooltipContent={
                                    <span>
                                        Act now and get early access savings on
                                        the automation add-on{' '}
                                        <i>(limited time offer)</i>
                                    </span>
                                }
                                isIntervalAbbreviated={isIntervalAbbreviated}
                            />
                        ) : (
                            <i>{addOnAmount}</i>
                        )}
                    </div>
                    <Tooltip
                        target={`automation-text-${id}`}
                        placement="top-start"
                        innerClassName={css.tooltip}
                        fade={false}
                    >
                        Leverage self-service to provide instant answers in
                        Gorgias Chat and Help Center, 24/7:
                        <ul>
                            <li>Automated track flow</li>
                            <li>Return & cancel flows</li>
                            <li>Customized report issue workflows</li>
                            <li>Self-service statistics</li>
                        </ul>
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
                        Automation
                    </div>
                    <div className={css.amountContainer}>
                        {typeof addOnAmount === 'number' &&
                        plan.currency &&
                        plan.interval ? (
                            <SubscriptionAmount
                                amount={addOnAmount}
                                discountedAmount={addOnAmount * 2}
                                className={classnames(css.amount)}
                                currency={plan.currency}
                                interval={plan.interval}
                                renderAmount={(amount) => <b>{amount}</b>}
                                tooltipContent={
                                    <span>
                                        Act now and get early access savings on
                                        the automation add-on{' '}
                                        <i>(limited time offer)</i>
                                    </span>
                                }
                                isIntervalAbbreviated={isIntervalAbbreviated}
                            />
                        ) : (
                            <i>{addOnAmount}</i>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default AutomationAmount
