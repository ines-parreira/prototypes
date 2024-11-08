import classNames from 'classnames'
import React from 'react'

import {PlanInterval} from 'models/billing/types'

import {formatAmount} from '../../utils/formatAmount'
import css from './SummaryTotal.less'

export type SummaryTotalWithDiscountsProps = {
    totalWithoutDiscounts: number
    totalWithDiscounts: number
    discountAmount: number
    interval: PlanInterval
    currency: string
}

const SummaryTotalWithDiscounts = ({
    totalWithoutDiscounts,
    totalWithDiscounts,
    discountAmount,
    interval,
    currency,
}: SummaryTotalWithDiscountsProps) => {
    return (
        <div>
            {discountAmount > 0 && (
                <>
                    <div className={classNames(css.total, css.discountLine)}>
                        <div>Subtotal</div>
                        <div>
                            <span aria-label="Subtotal">
                                {formatAmount(
                                    totalWithoutDiscounts / 100,
                                    currency
                                )}
                            </span>
                            /{interval}
                        </div>
                    </div>
                    <div className={classNames(css.total, css.discountLine)}>
                        <div>Discount</div>
                        <div>
                            <span aria-label="Discount amount">
                                - {formatAmount(discountAmount / 100, currency)}
                            </span>
                            /{interval}
                        </div>
                    </div>
                </>
            )}
            <div className={css.total}>
                <div className={css.totalTitle}>Total</div>
                <div className={css.totalPrice}>
                    <span aria-label="Total price">
                        {formatAmount(totalWithDiscounts / 100, currency)}
                    </span>
                    /{interval}
                </div>
            </div>
        </div>
    )
}

export default SummaryTotalWithDiscounts
