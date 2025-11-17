import { useMemo } from 'react'

import moment from 'moment'

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useAverageDiscountPercentage } from 'domains/reporting/pages/automate/aiSalesAgent/useAverageDiscountPercentage'
import { useAverageOrdersPerDayTrend } from 'domains/reporting/pages/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import type { TwoDimensionalDataItem } from 'domains/reporting/pages/types'
import useAppSelector from 'hooks/useAppSelector'
import { mockedCategories } from 'pages/aiAgent/Onboarding/components/KnowledgePreview/constants'
import type { TopElement } from 'pages/aiAgent/Onboarding/components/TopElementsCard/types'
import type { Product } from 'pages/aiAgent/Onboarding/components/TopProductsCard/types'
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

const generateRandomValuesForLastMonth = (): { x: string; y: number }[] => {
    const today = moment()
    const startOfLastMonth = today.clone().subtract(1, 'month').startOf('month')
    const endOfLastMonth = today.clone().subtract(1, 'month').endOf('month')

    const daysInLastMonth = endOfLastMonth.diff(startOfLastMonth, 'days') + 1
    return Array.from({ length: daysInLastMonth }, (_, index) => {
        const currentDate = startOfLastMonth.clone().add(index, 'days')
        return {
            x: currentDate.toDate().toLocaleDateString('en', {
                day: 'numeric',
                month: 'short',
            }),
            y: Math.floor(Math.random() * (99 - 10 + 1)) + 10, // Random y value between 10 and 99
        }
    })
}

const fakeProcessedAverageOrdersPerDayTrend = [
    {
        values: generateRandomValuesForLastMonth(),
        label: 'Line',
    },
]

const fakeAverageDiscountPercentage = 10

const useProcessedAverageOrdersPerDayTrend = (
    filters: StatsFilters,
    timezone: string,
): TwoDimensionalDataItem[] | undefined => {
    const { data } = useAverageOrdersPerDayTrend(
        filters,
        timezone,
        ReportingGranularity.Day,
    )

    const getFormattedValues = () => {
        if (data === undefined) return undefined
        const averageOrdersPerDay = [
            {
                values: data[0]?.map((item) => ({
                    x: new Date(item.dateTime).toLocaleDateString('en', {
                        day: 'numeric',
                        month: 'short',
                    }),
                    y: item.value,
                })),
                label: 'Line',
            },
        ]

        // Check if all "y" values are 0
        const allYValuesAreZero = averageOrdersPerDay[0].values.every(
            (item) => item.y === 0,
        )

        if (allYValuesAreZero) {
            return fakeProcessedAverageOrdersPerDayTrend
        }

        return averageOrdersPerDay
    }
    return useMemo(getFormattedValues, [data])
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
                : (averageDiscountPercentage.data?.value ??
                  fakeAverageDiscountPercentage),
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
