import React, {ReactNode} from 'react'
import classnames from 'classnames'

import css from './SubscriptionAmount.less'

type Props = {
    amount?: number
    className?: string
    currency: string
    interval: string
    renderAmount?: (amount: ReactNode) => ReactNode
}

const SubscriptionAmount = ({
    amount,
    className,
    currency,
    interval,
    renderAmount = (amount) => amount,
}: Props) => (
    <div className={classnames(css.amount, className)}>
        {renderAmount(
            typeof amount === 'number' &&
                new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(amount)
        )}{' '}
        / {interval}
    </div>
)

export default SubscriptionAmount
