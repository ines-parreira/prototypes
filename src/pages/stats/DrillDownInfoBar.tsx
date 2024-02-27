import React from 'react'
import Loader from 'pages/common/components/Loader/Loader'
import {DrillDownDownloadButton} from 'pages/stats/DrillDownDownloadButton'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {useDrillDownData} from 'hooks/reporting/useDrillDownData'
import {DRILLDOWN_QUERY_LIMIT} from 'utils/reporting'

import css from './DrillDownInfobar.less'

const getTheInfoLabel = (totalResults: number) => {
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

export const TOTAL_RESULTS_PLACEHOLDER = 'Fetching tickets...'

export const DrillDownInfoBar = ({
    metricData,
}: {
    metricData: DrillDownMetric
}) => {
    const {isFetching, totalResults} = useDrillDownData(metricData)

    return (
        <div className={css.wrapper}>
            <div className={css.icon}>
                {isFetching ? (
                    <Loader size="14px" minHeight="14px" />
                ) : (
                    <i className="material-icons">info</i>
                )}
            </div>
            <div className={css.text}>
                {isFetching
                    ? TOTAL_RESULTS_PLACEHOLDER
                    : getTheInfoLabel(totalResults)}
            </div>
            <DrillDownDownloadButton metricData={metricData} />
        </div>
    )
}
