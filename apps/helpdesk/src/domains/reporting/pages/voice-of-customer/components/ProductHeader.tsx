import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTicketCountPerProduct } from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'
import css from 'domains/reporting/pages/voice-of-customer/components/ProductHeader.less'
import { ProductImage } from 'domains/reporting/pages/voice-of-customer/components/ProductImage'
import { formatDateRange } from 'domains/reporting/pages/voice-of-customer/utils'
import { SidePanelProduct } from 'domains/reporting/state/ui/stats/sidePanelSlice'

export const ProductHeader = ({ product }: { product: SidePanelProduct }) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { data } = useTicketCountPerProduct(
        cleanStatsFilters,
        userTimezone,
        undefined,
        product.id,
    )
    const ticketCount = formatMetricValue(data?.value, 'integer')

    const formattedPeriod = formatDateRange(
        cleanStatsFilters.period.start_datetime,
        cleanStatsFilters.period.end_datetime,
        userTimezone,
    )

    return (
        <div className={css.container}>
            <ProductImage
                src={product.thumbnail_url}
                alt={product.name}
                size="lg"
            />
            <div className={css.title}>
                <h2>{product.name}</h2>
                <p>
                    {`${ticketCount} tickets`} | {formattedPeriod}
                </p>
            </div>
        </div>
    )
}
