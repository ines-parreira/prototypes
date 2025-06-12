import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTopIntentPerProduct } from 'hooks/reporting/voice-of-customer/useTopIntentPerProduct'
import { formatCategory } from 'pages/stats/ticket-insights/components/DistributionCategoryCell'
import { CellWrapper } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/CellWrapper'
import css from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsCellContent.less'
import { PropsWithProduct } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/types'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

export const ProductFeedbackCell = ({
    product,
    intentCustomFieldId,
}: PropsWithProduct & {
    intentCustomFieldId: number
}) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, isFetching } = useTopIntentPerProduct(
        cleanStatsFilters,
        userTimezone,
        String(intentCustomFieldId),
        product.id,
    )

    return (
        <CellWrapper
            column={ProductInsightsTableColumns.Feedback}
            isLoading={isFetching}
        >
            <div className={css.feedback}>
                {formatCategory(data.value ?? '')}
            </div>
        </CellWrapper>
    )
}
