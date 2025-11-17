import React from 'react'

import { Link, useParams } from 'react-router-dom'

import type { JourneyConfigurationApiDTO } from '@gorgias/convert-client'

import { STEPS_NAMES } from 'AIJourney/constants'
import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

import css from './DiscountCard.less'

export type DiscountCardProps = {
    totalRevenue?: MetricProps
    isDiscountEnabled?: boolean
    journeyType?: string
    maxDiscount?: JourneyConfigurationApiDTO['max_discount_percent']
}
export const DiscountCard = ({
    totalRevenue,
    isDiscountEnabled,
    journeyType = 'cart-abandoned',
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
                        to={`/app/ai-journey/${shopName}/${journeyType}/${STEPS_NAMES.SETUP}`}
                    >
                        here
                    </Link>
                </div>
            )}
        </div>
    )
}
