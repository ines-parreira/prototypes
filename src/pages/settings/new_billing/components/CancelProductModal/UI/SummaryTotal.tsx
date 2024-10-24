import React from 'react'

import css from './SummaryTotal.less'

type CancellationTotalProps = {
    total: number
    interval: string
}
const SummaryTotal = ({total, interval}: CancellationTotalProps) => {
    return (
        <div className={css.container}>
            <div className={css.total}>
                <div className={css.totalTitle}>Total with plan updates</div>
                <div className={css.totalPrice}>
                    <span>${total}</span>/{interval}
                </div>
            </div>
        </div>
    )
}

export default SummaryTotal
