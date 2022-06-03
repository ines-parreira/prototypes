import React, {ReactNode, useCallback, useMemo} from 'react'
import classnames from 'classnames'

import Tooltip from 'pages/common/components/Tooltip'
import {PlanInterval} from 'models/billing/types'
import useId from 'hooks/useId'

import css from './SubscriptionAmount.less'

type Props = {
    amount?: number
    fullAmount?: number
    className?: string
    currency: string
    interval: string
    isIntervalAbbreviated?: boolean
    renderAmount?: (amount: ReactNode) => ReactNode
    tooltipContent?: ReactNode
}

const SubscriptionAmount = ({
    amount,
    fullAmount,
    className,
    currency,
    interval,
    isIntervalAbbreviated = false,
    renderAmount = (amount) => amount,
    tooltipContent,
}: Props) => {
    const id = useId()
    const tootltipTargetID = 'subscription-amount-tooltip-target-' + id

    const formatAmount = useCallback(
        (amount: number) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount)
        },
        [currency]
    )

    const subscriptionInterval = useMemo(() => {
        if (isIntervalAbbreviated) {
            if (interval === PlanInterval.Month) {
                return 'mo'
            } else if (interval === PlanInterval.Year) {
                return 'yr'
            }
            return interval
        }
        return interval
    }, [interval, isIntervalAbbreviated])

    return (
        <>
            <div className={classnames(css.amountWrapper, className)}>
                <span
                    className={classnames(css.amount, {
                        [css.withTooltip]: tooltipContent,
                    })}
                    {...(tooltipContent && {
                        id: tootltipTargetID,
                    })}
                >
                    {fullAmount && (
                        <>
                            <span className={css.fullAmount}>
                                {typeof fullAmount === 'number' &&
                                    formatAmount(fullAmount)}
                            </span>
                            <wbr />
                        </>
                    )}
                    {renderAmount(
                        typeof amount === 'number' && formatAmount(amount)
                    )}{' '}
                    / {subscriptionInterval}
                </span>
            </div>
            {tooltipContent && (
                <Tooltip
                    target={tootltipTargetID}
                    placement="top"
                    innerClassName={css.tooltip}
                    autohide={false}
                    fade={false}
                >
                    {tooltipContent}
                </Tooltip>
            )}
        </>
    )
}

export default SubscriptionAmount
