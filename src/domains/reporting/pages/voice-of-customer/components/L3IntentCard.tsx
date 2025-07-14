import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTicketCountPerProduct } from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import { useTicketCountPerIntentForProduct } from 'domains/reporting/hooks/voice-of-customer/metricsPerProductAndIntent'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { IntentCard } from 'domains/reporting/pages/common/components/IntentCard'
import { useOpenDrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { VoiceOfCustomerMetricWithDrillDown } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type Product = { id: string; name: string }

export type L3IntentCardProps = {
    intent: string
    product: Product
    intentCustomFieldId: number
}

const getFiltersForPreviousPeriod = (
    filters: StatsFiltersWithLogicalOperator,
): StatsFiltersWithLogicalOperator => ({
    ...filters,
    period: getPreviousPeriod(filters.period),
})

export const getDrillDownTitle = (
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
    intentCustomFieldId: number,
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
