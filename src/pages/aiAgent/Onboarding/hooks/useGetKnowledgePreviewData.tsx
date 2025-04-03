import { useMemo } from 'react'

import moment from 'moment'

import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { mockedCategories } from 'pages/aiAgent/Onboarding/components/KnowledgePreview/constants'
import { TopElement } from 'pages/aiAgent/Onboarding/components/TopElementsCard/types'
import { Product } from 'pages/aiAgent/Onboarding/components/TopProductsCard/types'
import { useAverageDiscountPercentage } from 'pages/stats/automate/aiSalesAgent/useAverageDiscountPercentage'
import { useAverageOrdersPerDayTrend } from 'pages/stats/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { TwoDimensionalDataItem } from 'pages/stats/types'
import { getTimezone } from 'state/currentUser/selectors'

import useTopProducts from '../components/TopProductsCard/hooks'
import { useGetAverageOrderValue } from './useGetAverageOrderValue'
import { useGetRepeatRate } from './useGetRepeatRate'

type KnowledgePreviewData = {
    topProducts?: Product[]
    isTopProductsLoading?: boolean
    averageOrders?: TwoDimensionalDataItem[]
    experienceScore?: number
    categories?: TopElement[]
    averageDiscount?: number
    repeatRate?: number
    averageOrderValue?: number
    isAverageOrderValueLoading?: boolean
    isRepeatRateLoading?: boolean
}

const useProcessedAverageOrdersPerDayTrend = (
    filters: StatsFilters,
    timezone: string,
): TwoDimensionalDataItem[] | undefined => {
    const { data: averageOrdersPerDay } = useAverageOrdersPerDayTrend(
        filters,
        timezone,
        ReportingGranularity.Day,
    )

    const getFormattedValues = () => {
        if (averageOrdersPerDay === undefined) return undefined
        return [
            {
                values: averageOrdersPerDay[0].map((item) => ({
                    x: new Date(item.dateTime).toLocaleDateString('en', {
                        day: 'numeric',
                        month: 'short',
                    }),
                    y: item.value,
                })),
                label: 'Line',
            },
        ]
    }
    return useMemo(getFormattedValues, [averageOrdersPerDay])
}

export const useGetKnowledgePreviewData = ({
    shopIntegrationId,
    currency,
}: {
    shopIntegrationId: number
    currency?: string
}) => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'
    const filters: StatsFilters = {
        period: {
            start_datetime: moment()
                .subtract(1, 'month')
                .startOf('day')
                .format(),
            end_datetime: moment().endOf('day').format(),
        },
        storeIntegrations: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [shopIntegrationId],
        },
    }

    const averageOrders = useProcessedAverageOrdersPerDayTrend(
        filters,
        timezone,
    )
    const averageDiscountPercentage = useAverageDiscountPercentage(
        filters,
        timezone,
    )
    const { data: repeatRate, isLoading: isRepeatRateLoading } =
        useGetRepeatRate(filters, timezone)

    const { data: averageOrderValue, isLoading: isAverageOrderValueLoading } =
        useGetAverageOrderValue(filters, timezone)

    const { data: topProducts, isLoading: isTopProductsLoading } =
        useTopProducts({
            filters,
            timezone,
            currency: currency,
        })

    return {
        data: {
            experienceScore: 50,
            categories: mockedCategories,
            averageDiscount: averageDiscountPercentage.isFetching
                ? undefined
                : (averageDiscountPercentage.data?.value ?? 0),
            repeatRate,
            isRepeatRateLoading,
            averageOrders: averageOrders,
            averageOrderValue,
            isAverageOrderValueLoading,
            topProducts,
            isTopProductsLoading,
        } satisfies KnowledgePreviewData,
    }
}
