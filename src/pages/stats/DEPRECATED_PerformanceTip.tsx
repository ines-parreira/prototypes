import React from 'react'
import sanitizeHtml from 'sanitize-html'
import {usePerformanceTips} from 'hooks/reporting/usePerformanceTips'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import MetricTip from 'pages/stats/MetricTip'

import {MetricName} from 'services/reporting/constants'

export const DEPRECATED_PerformanceTip = ({
    metric,
    data,
}: {
    metric: MetricName
    data: MetricTrend['data']
}) => {
    const {type, title, content, hint} = usePerformanceTips(
        metric,
        data?.value || null
    )

    return (
        <MetricTip type={type} title={title} hint={hint}>
            <div
                className="body-regular"
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(`Tip: ${content}`),
                }}
            />
        </MetricTip>
    )
}
