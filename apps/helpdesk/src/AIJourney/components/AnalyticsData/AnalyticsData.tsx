import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

import css from './AnalyticsData.less'

type AnalyticsDataProps = {
    data: any[]
}

export const AnalyticsData = ({ data }: AnalyticsDataProps) => {
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
                            <>
                                <div className={css.metricInformation}>
                                    <div className={css.metricValue}>
                                        <b>{formattedValue}</b>
                                    </div>
                                </div>
                                <div className={css.trendBadge}>
                                    <TrendBadge
                                        value={metric.value}
                                        prevValue={metric.prevValue}
                                        metricFormat={metric.metricFormat}
                                        currency={metric.currency}
                                        interpretAs="more-is-better"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
