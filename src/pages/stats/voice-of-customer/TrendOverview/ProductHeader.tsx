import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTicketCountPerProduct } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { formatMetricValue } from 'pages/stats/common/utils'
import { ProductImage } from 'pages/stats/voice-of-customer/components/ProductImage'
import css from 'pages/stats/voice-of-customer/TrendOverview/ProductHeader.less'
import { formatDateRange } from 'pages/stats/voice-of-customer/utils'
import { SidePanelProduct } from 'state/ui/stats/sidePanelSlice'

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
