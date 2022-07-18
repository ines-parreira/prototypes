import React from 'react'
import classnames from 'classnames'

import {Plan} from '../../../../models/billing/types'
import SubscriptionAmount from '../../common/SubscriptionAmount'

import css from './TotalAmount.less'

type Props = {
    addOnAmount?: number | string
    isAutomationChecked?: boolean
    plan: Partial<Pick<Plan, 'amount' | 'currency' | 'id' | 'interval'>>
    isEditable?: boolean
}

const TotalAmount = ({
    addOnAmount,
    isAutomationChecked,
    plan,
    isEditable = true,
}: Props) => {
    return (
        <div className={css.row}>
            {plan.amount && plan.currency && plan.interval ? (
                <>
                    <div>Total</div>
                    <div className={css.amountContainer}>
                        <SubscriptionAmount
                            amount={
                                ((isAutomationChecked || !isEditable) &&
                                typeof addOnAmount === 'number'
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
    )
}

export default TotalAmount
