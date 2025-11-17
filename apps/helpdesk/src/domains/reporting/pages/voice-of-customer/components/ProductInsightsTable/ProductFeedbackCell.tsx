import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTopIntentPerProduct } from 'domains/reporting/hooks/voice-of-customer/useTopIntentPerProduct'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import { CellWrapper } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/CellWrapper'
import css from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsCellContent.less'
import type { PropsWithProduct } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/types'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'

const getFeedback = (intent: string) => {
    const segments = intent.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
    return segments.at(-1)
}

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

    const feedback = getFeedback(data.value || '')

    return (
        <CellWrapper
            column={ProductInsightsTableColumns.Feedback}
            isLoading={isFetching}
        >
            <div className={css.feedback}>{feedback}</div>
        </CellWrapper>
    )
}
