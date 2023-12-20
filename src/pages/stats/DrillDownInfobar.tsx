import React from 'react'
import {DrillDownDownloadButton} from 'pages/stats/DrillDownDownloadButton'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {useDrillDownData} from 'hooks/reporting/useDrillDownData'
import {DRILLDOWN_QUERY_LIMIT} from 'utils/reporting'

import css from './DrillDownInfobar.less'

const getTheInfo = (totalResults: number) => {
    if (totalResults < DRILLDOWN_QUERY_LIMIT) {
        return (
            <>
                <strong>{totalResults}</strong> tickets are displayed.
            </>
        )
    }
    return (
        <>
            First <strong>{DRILLDOWN_QUERY_LIMIT}</strong> tickets are
            displayed.
        </>
    )
}

export const TOTAL_RESULTS_PLACEHOLDER = '?'

export const DrillDownInfobar = ({
    metricData,
}: {
    metricData: DrillDownMetric
}) => {
    const {isFetching, totalResults} = useDrillDownData(metricData)

    return (
        <div className={css.wrapper}>
            <div className={css.icon}>
                <i className="material-icons">info</i>
            </div>
            <div className={css.text}>
                <strong>
                    First{' '}
                    {isFetching
                        ? TOTAL_RESULTS_PLACEHOLDER
                        : getTheInfo(totalResults)}
                </strong>{' '}
                shown.
            </div>
            <DrillDownDownloadButton metricData={metricData} />
        </div>
    )
}
