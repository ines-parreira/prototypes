import React from 'react'

import {Cadence} from 'models/billing/types'

import css from './SummaryTotal.less'

type CancellationTotalProps = {
    total: number
    cadence: Cadence
}
const SummaryTotal = ({total, cadence}: CancellationTotalProps) => {
    return (
        <div className={css.container}>
            <div className={css.total}>
                <div className={css.totalTitle}>Total with plan updates</div>
                <div className={css.totalPrice}>
                    <span>${total}</span>/{cadence}
                </div>
            </div>
        </div>
    )
}

export default SummaryTotal
