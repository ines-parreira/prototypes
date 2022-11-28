import React from 'react'
import classnames from 'classnames'

import {PlanInterval} from '../../../../models/billing/types'
import SubscriptionAmount from '../../common/SubscriptionAmount'

import css from './TotalAmount.less'

type Props = {
    addOnAmount?: number | string
    amount?: number
    currency?: string
    interval?: PlanInterval
    isAutomationChecked?: boolean
    isEditable?: boolean
}

const TotalAmount = ({
    addOnAmount,
    amount,
    currency,
    interval,
    isAutomationChecked,
    isEditable = true,
}: Props) => {
    return (
        <div className={css.row}>
            {amount && currency && interval ? (
                <>
                    <div>Total</div>
                    <div className={css.amountContainer}>
                        <SubscriptionAmount
                            amount={
                                ((isAutomationChecked || !isEditable) &&
                                typeof addOnAmount === 'number'
                                    ? addOnAmount
                                    : 0) + amount
                            }
                            className={css.amount}
                            currency={currency}
                            interval={interval}
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
