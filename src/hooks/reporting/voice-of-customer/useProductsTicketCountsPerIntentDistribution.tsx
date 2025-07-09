import { useMemo } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useProductsTicketCountsPerIntentWithEnrichment } from 'hooks/reporting/voice-of-customer/metricsPerProductAndIntent'
import { OrderDirection } from 'models/api/types'
import { TicketProductsEnrichedMeasure } from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import { EnrichmentFields } from 'models/reporting/types'
import { getPreviousPeriod } from 'utils/reporting'

export const PRODUCTS_PER_INTENT_LIMIT = 5

export type ProductTicketCountsPerIntentItem = {
    name: string
    value: number
    prevValue: number
    productId: string
    productUrl: string
}

export type ProductsTicketCountsPerIntentDistributionResult = {
    data: ProductTicketCountsPerIntentItem[]
    isFetching: boolean
    isError: boolean
}

export const useProductsTicketCountsPerIntentDistribution = (
    intentCustomFieldId: number,
    intentsCustomFieldValueString: string,
    sorting?: OrderDirection,
): ProductsTicketCountsPerIntentDistributionResult => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { data, isFetching, isError } =
        useProductsTicketCountsPerIntentWithEnrichment(
            cleanStatsFilters,
            userTimezone,
            intentCustomFieldId,
            intentsCustomFieldValueString,
            sorting,
            PRODUCTS_PER_INTENT_LIMIT,
        )

    const {
        data: previousPeriodData,
        isFetching: isPreviousPeriodFetching,
        isError: isPreviousPeriodError,
    } = useProductsTicketCountsPerIntentWithEnrichment(
        {
            ...cleanStatsFilters,
            period: getPreviousPeriod(cleanStatsFilters.period),
        },
        userTimezone,
        intentCustomFieldId,
        intentsCustomFieldValueString,
        sorting,
        PRODUCTS_PER_INTENT_LIMIT,
    )

    const formattedData = useMemo(() => {
        return data?.allData.map((product) => {
            const previousPeriodProduct = previousPeriodData?.allData?.find(
                (previousPeriodItem) =>
                    previousPeriodItem[
                        EnrichmentFields.ProductExternalProductId
                    ] === product[EnrichmentFields.ProductExternalProductId],
            )

            return {
                name: product[EnrichmentFields.ProductTitle],
                value: product[TicketProductsEnrichedMeasure.TicketCount],
                prevValue:
                    previousPeriodProduct?.[
                        TicketProductsEnrichedMeasure.TicketCount
                    ],
                productId: product[EnrichmentFields.ProductExternalProductId],
                productUrl: product[EnrichmentFields.ProductThumbnailUrl],
            }
        })
    }, [data?.allData, previousPeriodData?.allData])

    return {
        data: formattedData || [],
        isFetching: isFetching || isPreviousPeriodFetching,
        isError: isError || isPreviousPeriodError,
    }
}
