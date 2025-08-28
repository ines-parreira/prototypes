import React from 'react'

import { Link, useParams } from 'react-router-dom'

import { CartAbandonedJourneyConfigurationApiDTO } from '@gorgias/convert-client'

import { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

import css from './DiscountCard.less'

export type DiscountCardProps = {
    totalRevenue?: MetricProps
    isDiscountEnabled?: boolean
    maxDiscount?: CartAbandonedJourneyConfigurationApiDTO['max_discount_percent']
}
export const DiscountCard = ({
    totalRevenue,
    isDiscountEnabled,
    maxDiscount,
}: DiscountCardProps) => {
    const { shopName } = useParams<{ shopName: string }>()

    const potentialRevenue = totalRevenue?.value
        ? totalRevenue.value / 2
        : undefined
    const potentialRevenueFormattedValue = formatMetricValue(
        potentialRevenue,
        totalRevenue?.metricFormat,
        undefined,
        totalRevenue?.currency,
    )

    return (
        <div className={css.discountInfo}>
            <div className={css.discountInfoIcon}>
                <i
                    style={{ fontSize: '12px' }}
                    className="material-icons-outlined"
                >
                    star
                </i>
            </div>
            {isDiscountEnabled ? (
                `Discount code included is ${maxDiscount}%`
            ) : (
                <div>
                    Boost conversion by 50%{' '}
                    {potentialRevenue !== undefined &&
                        `(+${potentialRevenueFormattedValue}) `}
                    by including a discount code{' '}
                    <Link
                        role="link"
                        className={css.discountLink}
                        to={`/app/ai-journey/${shopName}/conversation-setup`}
                    >
                        here
                    </Link>
                </div>
            )}
        </div>
    )
}
