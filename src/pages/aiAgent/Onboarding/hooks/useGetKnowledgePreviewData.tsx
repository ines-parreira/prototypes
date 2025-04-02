import { useMemo } from 'react'

import moment from 'moment/moment'

import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    mockedCategories,
    mockedProducts,
} from 'pages/aiAgent/Onboarding/components/KnowledgePreview/constants'
import { TopElement } from 'pages/aiAgent/Onboarding/components/TopElementsCard/types'
import { Product } from 'pages/aiAgent/Onboarding/components/TopProductsCard/types'
import { useAverageDiscountPercentage } from 'pages/stats/automate/aiSalesAgent/useAverageDiscountPercentage'
import { useAverageOrdersPerDayTrend } from 'pages/stats/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { TwoDimensionalDataItem } from 'pages/stats/types'
import { getTimezone } from 'state/currentUser/selectors'

type KnowledgePreviewData = {
    products?: Product[]
    averageOrders?: TwoDimensionalDataItem[]
    experienceScore?: number
    categories?: TopElement[]
    averageDiscount?: number
    repeatRate?: number
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
}: {
    shopIntegrationId: number
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

    return {
        data: {
            products: mockedProducts,
            experienceScore: 50,
            categories: mockedCategories,
            averageDiscount: averageDiscountPercentage.isFetching
                ? undefined
                : (averageDiscountPercentage.data?.value ?? 0),
            repeatRate: 2,
            averageOrders: averageOrders,
        } satisfies KnowledgePreviewData,
    }
}
