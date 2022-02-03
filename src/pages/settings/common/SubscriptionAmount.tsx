import React, {ReactNode, useCallback, useMemo} from 'react'
import classnames from 'classnames'

import _uniqueId from 'lodash/uniqueId'
import Tooltip from '../../common/components/Tooltip'
import {PlanInterval} from '../../../models/billing/types'
import css from './SubscriptionAmount.less'

type Props = {
    amount?: number
    discountedAmount?: number
    className?: string
    currency: string
    interval: string
    isIntervalAbbreviated?: boolean
    renderAmount?: (amount: ReactNode) => ReactNode
    tooltipContent?: ReactNode
}

const SubscriptionAmount = ({
    amount,
    discountedAmount,
    className,
    currency,
    interval,
    isIntervalAbbreviated = false,
    renderAmount = (amount) => amount,
    tooltipContent,
}: Props) => {
    const tootltipTargetID = useMemo(
        () => _uniqueId('subscription-amount-tooltip-target-'),
        []
    )

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
                    {...(tooltipContent && {
                        id: tootltipTargetID,
                        className: css.amount,
                    })}
                >
                    {discountedAmount && (
                        <>
                            <span className={css.discountedAmount}>
                                {typeof discountedAmount === 'number' &&
                                    formatAmount(discountedAmount)}
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
