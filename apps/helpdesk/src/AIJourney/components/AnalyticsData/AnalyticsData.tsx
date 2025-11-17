import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { AnalyticsBarChart } from 'AIJourney/components/AnalyticsBarChart/AnalyticsBarChart'
import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

import css from './AnalyticsData.less'

type AnalyticsDataProps = {
    data: MetricProps[]
    period: {
        start: string
        end: string
    }
}

export const AnalyticsData = ({ data, period }: AnalyticsDataProps) => {
    return (
        <div className={css.journeyData}>
            {data?.map((metric, index) => {
                const formattedValue = formatMetricValue(
                    metric.value,
                    metric.metricFormat,
                    undefined,
                    metric.currency,
                )

                return (
                    <div className={css.metric} key={index}>
                        <span>{metric.label}</span>

                        {metric.isLoading ? (
                            <LoadingSpinner
                                style={{ height: '25px', width: '25px' }}
                            />
                        ) : (
                            <div className={css.metricContainer}>
                                <div className={css.metricInformation}>
                                    <div className={css.metricValue}>
                                        <b>{formattedValue}</b>
                                    </div>
                                    <div className={css.trendBadge}>
                                        <TrendBadge
                                            value={metric.value}
                                            prevValue={metric.prevValue}
                                            metricFormat={metric.metricFormat}
                                            currency={metric.currency}
                                            interpretAs={metric.interpretAs}
                                        />
                                    </div>
                                </div>
                                {metric.series && (
                                    <AnalyticsBarChart
                                        period={period}
                                        data={metric.series}
                                        currency={metric.currency}
                                        metricFormat={metric.metricFormat}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
