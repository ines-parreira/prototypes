import { useHistory, useParams } from 'react-router-dom'

import { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import sphereIcon from 'assets/img/ai-journey/sphere.svg'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

import css from './DiscountCard.less'

export const DiscountCard = ({
    totalRevenue,
}: {
    totalRevenue?: MetricProps
}) => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()

    const potentialRevenue = totalRevenue?.value
        ? totalRevenue.value / 2
        : undefined
    const potentialRevenueFormattedValue = formatMetricValue(
        potentialRevenue,
        totalRevenue?.metricFormat,
        undefined,
        totalRevenue?.currency,
    )

    return (
        <div className={css.discountCard}>
            <div className={css.content}>
                <div className={css.title}>
                    <img src={sphereIcon} alt="sphere-icon" />

                    <span>Immediate win</span>
                </div>
                Enable the Discount Codes to boost conversion by 50%{' '}
                {potentialRevenue && `(+${potentialRevenueFormattedValue})`}
            </div>
            <button
                className={css.redirectIcon}
                onClick={() => {
                    history.push(
                        `/app/ai-journey/${shopName}/conversation-setup`,
                    )
                }}
            >
                <i className="material-icons-outlined">arrow_forward</i>
            </button>
        </div>
    )
}
