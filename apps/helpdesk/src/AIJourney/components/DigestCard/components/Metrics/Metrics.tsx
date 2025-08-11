import { LoadingSpinner } from '@gorgias/axiom'

import { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

import css from './Metrics.less'

export const Metrics = ({
    label,
    value,
    prevValue,
    interpretAs,
    metricFormat,
    currency,
    isLoading,
}: MetricProps) => {
    const formattedValue = formatMetricValue(
        value,
        metricFormat,
        undefined,
        currency,
    )
    return (
        <div className={css.metric}>
            <span>{label}</span>
            <div className={css.metricInformation}>
                {isLoading ? (
                    <LoadingSpinner style={{ height: '25px', width: '25px' }} />
                ) : (
                    <>
                        <div className={css.metricValue}>{formattedValue}</div>
                        <TrendBadge
                            value={value}
                            prevValue={prevValue}
                            metricFormat={metricFormat}
                            currency={currency}
                            interpretAs={interpretAs}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
