import React, {useMemo} from 'react'
import {Input, Label} from 'reactstrap'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'

import {Plan} from '../../../../models/billing/types'
import Tooltip from '../../../common/components/Tooltip'
import SubscriptionAmount from '../../common/SubscriptionAmount'

import css from './RecurringPrices.less'

type Props = {
    addOnAmount?: number | string
    isAutomationChecked?: boolean
    onAutomationChange?: () => void
    plan: Partial<Pick<Plan, 'amount' | 'currency' | 'id' | 'interval'>>
    editable?: boolean
}

const RecurringPrices = ({
    addOnAmount,
    isAutomationChecked,
    onAutomationChange,
    plan,
    editable = true,
}: Props) => {
    const id = useMemo(() => _uniqueId(plan.id), [])

    return (
        <>
            {editable ? (
                <Label
                    htmlFor={id}
                    check
                    className={classnames(css.row, css.automationRow)}
                >
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
                                className={classnames(css.amount, {
                                    [css.amountDisabled]: !isAutomationChecked,
                                })}
                                currency={plan.currency}
                                interval={plan.interval}
                                renderAmount={(amount) => <b>{amount}</b>}
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
                        Leverage the power of self-service to answer customers
                        quickly, 24/7:
                        <br />
                        - Tracking order flows
                        <br />
                        - Customized report issue workflows
                        <br />- Return & Cancellations flows
                    </Tooltip>
                </Label>
            ) : (
                <div className={classnames(css.row, css.automationRow)}>
                    <div className={classnames('align-middle', css.addOnName)}>
                        Automation
                    </div>
                    <div className={css.amountContainer}>
                        {typeof addOnAmount === 'number' &&
                        plan.currency &&
                        plan.interval ? (
                            <SubscriptionAmount
                                amount={addOnAmount}
                                className={classnames(css.amount)}
                                currency={plan.currency}
                                interval={plan.interval}
                                renderAmount={(amount) => <b>{amount}</b>}
                            />
                        ) : (
                            <i>{addOnAmount}</i>
                        )}
                    </div>
                </div>
            )}

            <div className={css.row}>
                {typeof addOnAmount === 'number' &&
                plan.amount &&
                plan.currency &&
                plan.interval ? (
                    <>
                        <div>Total</div>
                        <div className={css.amountContainer}>
                            <SubscriptionAmount
                                amount={
                                    (isAutomationChecked || !editable
                                        ? addOnAmount
                                        : 0) + plan.amount
                                }
                                className={css.amount}
                                currency={plan.currency}
                                interval={plan.interval}
                                renderAmount={(amount) => <b>{amount}</b>}
                            />
                        </div>
                    </>
                ) : (
                    <div
                        className={classnames(
                            'mx-auto',
                            'font-weight-normal',
                            'font-italic'
                        )}
                    >
                        {addOnAmount}
                    </div>
                )}
            </div>
        </>
    )
}

export default RecurringPrices
