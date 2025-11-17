import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
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
    drilldown,
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
                        <div className={css.metricValue}>
                            {drilldown ? (
                                <DrillDownModalTrigger
                                    enabled={!!value}
                                    metricData={drilldown}
                                >
                                    {formattedValue}
                                </DrillDownModalTrigger>
                            ) : (
                                formattedValue
                            )}
                        </div>

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
