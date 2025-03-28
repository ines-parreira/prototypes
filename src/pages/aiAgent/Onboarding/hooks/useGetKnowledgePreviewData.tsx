import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    mockedCategories,
    mockedLocations,
    mockedProducts,
} from 'pages/aiAgent/Onboarding/components/KnowledgePreview/constants'
import { TopElement } from 'pages/aiAgent/Onboarding/components/TopElementsCard/types'
import { Product } from 'pages/aiAgent/Onboarding/components/TopProductsCard/types'
import { useAverageOrdersPerDayTrend } from 'pages/stats/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { TwoDimensionalDataItem } from 'pages/stats/types'
import { getTimezone } from 'state/currentUser/selectors'

type KnowledgePreviewData = {
    locations: TopElement[]
    products: Product[]
    averageOrders: TwoDimensionalDataItem[]
    experienceScore: number
    categories: TopElement[]
    averageDiscount: number
    repeatRate: number
}

const useProcessedAvarageOrdersPerDayTrend = (
    filters: StatsFilters,
): TwoDimensionalDataItem[] | undefined => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

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

export const useGetKnowledgePreviewData = () => {
    const getFormattedDateTime = (date: Date) => {
        date.setHours(0, 0, 0, 0)
        return date.toISOString()
    }

    const filters: StatsFilters = {
        period: {
            start_datetime: getFormattedDateTime(
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            ), // 30 days ago
            end_datetime: getFormattedDateTime(new Date()), // Today
        },
    }

    const averageOrders = useProcessedAvarageOrdersPerDayTrend(filters)

    return {
        data: {
            locations: mockedLocations,
            products: mockedProducts,
            experienceScore: 50,
            categories: mockedCategories,
            averageDiscount: 10,
            repeatRate: 2,
            averageOrders: averageOrders,
        } as KnowledgePreviewData,
    }
}
