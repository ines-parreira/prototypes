import React, {useMemo} from 'react'
import {Input, Label} from 'reactstrap'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'

import {Plan} from '../../../../models/billing/types'
import Tooltip from '../../../common/components/Tooltip'
import SubscriptionAmount from '../../common/SubscriptionAmount'

import css from './AutomationAmount.less'

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
                <Label htmlFor={id} check className={css.automationRow}>
                    {typeof addOnAmount === 'number' && (
                        <Input
                            className={classnames(
                                'form-check-input',
                                css.checkbox
                            )}
                            type="checkbox"
                            id={id}
                            checked={isAutomationChecked}
                            {...(!!onAutomationChange
                                ? {onChange: onAutomationChange}
                                : {readOnly: true})}
                        />
                    )}
                    <div
                        className={classnames(
                            'align-middle',
                            css.addOnName,
                            css.checkboxLabel
                        )}
                    >
                        <span id={`automation-text-${id}`}>Automation</span>
                    </div>
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
                </Label>
            ) : (
                <div className={css.automationRow}>
                    <div className={classnames('align-middle', css.addOnName)}>
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
