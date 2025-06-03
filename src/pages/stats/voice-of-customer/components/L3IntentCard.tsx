import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTicketCountPerProduct } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { useTicketCountPerIntentForProduct } from 'hooks/reporting/voice-of-customer/metricsPerProductAndIntent'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'models/reporting/queryFactories/utils'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import { IntentCard } from 'pages/stats/common/components/IntentCard'
import { useOpenDrillDownModal } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { VoiceOfCustomerMetricWithDrillDown } from 'pages/stats/voice-of-customer/VoiceOfCustomerMetricConfig'
import { getPreviousPeriod } from 'utils/reporting'

type Product = { id: string; name: string }

export type L3IntentCardProps = {
    intent: string
    product: Product
    intentCustomFieldId: string
}

const getFiltersForPreviousPeriod = (
    filters: StatsFiltersWithLogicalOperator,
): StatsFiltersWithLogicalOperator => ({
    ...filters,
    period: getPreviousPeriod(filters.period),
})

const getDrillDownTitle = (
    intentCustomFieldValueString: string,
    product: Product,
) => {
    const intent = intentCustomFieldValueString
        .split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
        .slice(0, 2)
        .join(' > ')
    return [product.name, '|', intent].join(' ')
}

const getDrillDownMetricData = (
    intentCustomFieldId: string,
    intentCustomFieldValueString: string,
    product: Product,
) => ({
    title: getDrillDownTitle(intentCustomFieldValueString, product),
    metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProduct,
    productId: product.id,
    intentCustomFieldId,
    intentCustomFieldValueString,
})

export const L3IntentCard = ({
    intent,
    intentCustomFieldId,
    product,
}: L3IntentCardProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const openDrillDownModal = useOpenDrillDownModal(
        getDrillDownMetricData(intentCustomFieldId, intent, product),
    )

    const ticketCountPerProduct = useTicketCountPerProduct(
        cleanStatsFilters,
        userTimezone,
        undefined,
        product.id,
    )

    const ticketCountPerIntentForProduct = useTicketCountPerIntentForProduct(
        cleanStatsFilters,
        userTimezone,
        intentCustomFieldId,
        product.id,
        undefined,
        intent,
    )

    const prevTicketCountPerIntentForProduct =
        useTicketCountPerIntentForProduct(
            getFiltersForPreviousPeriod(cleanStatsFilters),
            userTimezone,
            intentCustomFieldId,
            product.id,
            undefined,
            intent,
        )

    const ticketCount = ticketCountPerIntentForProduct.data?.value
    const prevTicketCount = prevTicketCountPerIntentForProduct.data?.value
    const totalTicketCount = ticketCountPerProduct.data?.value

    const isLoading =
        ticketCountPerProduct.isFetching ||
        ticketCountPerIntentForProduct.isFetching ||
        prevTicketCountPerIntentForProduct.isFetching

    return (
        <IntentCard
            intent={intent}
            ticketCount={ticketCount}
            prevTicketCount={prevTicketCount}
            totalTicketCount={totalTicketCount}
            onViewTickets={openDrillDownModal}
            isLoading={isLoading}
        />
    )
}
