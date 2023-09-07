import React from 'react'
import sanitizeHtml from 'sanitize-html'
import {usePerformanceTips} from 'hooks/reporting/usePerformanceTips'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import PerformanceTip from 'pages/stats/PerformanceTip'

import {MetricName} from 'services/reporting/constants'

export const SupportPerformanceTip = ({
    metric,
    data,
}: {
    metric: MetricName
    data: MetricTrend['data']
}) => {
    const tip = usePerformanceTips(metric, data?.value || null)

    return (
        <PerformanceTip
            avgMerchant={tip?.average ?? null}
            avgTooltip="The average and top 10% are computed based on the <a href='https://docs.gorgias.com/en-US/cx-performance-tips-238743'>data of Gorgias customers on the same plan</a>. It does not take into account your industry or channel."
            topTen={tip?.topTen ?? null}
            type={tip?.type}
        >
            <div
                className="body-regular"
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(tip?.content ?? ''),
                }}
            />
        </PerformanceTip>
    )
}
