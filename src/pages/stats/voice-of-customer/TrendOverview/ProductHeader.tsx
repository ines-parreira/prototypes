import moment from 'moment-timezone'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTicketCountPerProduct } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { formatMetricValue } from 'pages/stats/common/utils'
import { isUsLanguage } from 'pages/stats/utils'
import css from 'pages/stats/voice-of-customer/TrendOverview/ProductHeader.less'
import { SidePanelProduct } from 'state/ui/stats/sidePanelSlice'
import { SHORT_DATE_WITH_YEAR_US, SHORT_DATE_WITH_YEAR_WORLD } from 'utils/date'

const getDateFormat = () =>
    isUsLanguage() ? SHORT_DATE_WITH_YEAR_US : SHORT_DATE_WITH_YEAR_WORLD

export const ProductHeader = ({ product }: { product: SidePanelProduct }) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { data } = useTicketCountPerProduct(
        cleanStatsFilters,
        userTimezone,
        undefined,
        product.id,
    )
    const ticketCount = formatMetricValue(data?.value, 'integer')

    const format = getDateFormat()

    return (
        <div className={css.container}>
            <div className={css.thumbnail}>
                {<img src={product.thumbnail_url} alt={product.name} />}
            </div>
            <div className={css.title}>
                <h2>{product.name}</h2>
                <p>
                    {`${ticketCount} tickets`} |{' '}
                    {moment
                        .tz(
                            cleanStatsFilters.period.start_datetime,
                            userTimezone,
                        )
                        .format(format)}{' '}
                    -{' '}
                    {moment
                        .tz(cleanStatsFilters.period.end_datetime, userTimezone)
                        .format(format)}
                </p>
            </div>
        </div>
    )
}
