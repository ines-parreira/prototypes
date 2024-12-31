import {createElement, memo} from 'react'

import {ReportConfig} from 'pages/stats/custom-reports/types'

type Props<T extends string> = {
    chart: T
    config: ReportConfig<T>
}

export const CustomReportComponent = memo(
    <T extends string>({chart, config}: Props<T>) => {
        return createElement(config.charts[chart].chartComponent)
    }
)
