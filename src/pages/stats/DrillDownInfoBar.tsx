import React from 'react'
import Loader from 'pages/common/components/Loader/Loader'
import {DrillDownDownloadButton} from 'pages/stats/DrillDownDownloadButton'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {DRILLDOWN_QUERY_LIMIT} from 'utils/reporting'

import {DrillDownDataHook} from 'hooks/reporting/useDrillDownData'
import {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'
import {ConvertMetric} from 'state/ui/stats/types'
import css from './DrillDownInfobar.less'

const getObjectType = (metricData: DrillDownMetric) => {
    switch (metricData.metricName) {
        case ConvertMetric.CampaignSalesCount:
            return 'orders'
        default:
            return 'tickets'
    }
}

const getTheInfoLabel = (totalResults: number, objectType: string) => {
    if (totalResults < DRILLDOWN_QUERY_LIMIT) {
        return (
            <>
                <strong>{totalResults}</strong> {objectType} are displayed.
            </>
        )
    }
    return (
        <>
            Displaying (first) <strong>{DRILLDOWN_QUERY_LIMIT}</strong>{' '}
            {objectType}
            used to compute the metric.
        </>
    )
}

export const DrillDownInfoBar = ({
    metricData,
    useDataHook,
}: {
    metricData: DrillDownMetric
    useDataHook: DrillDownDataHook<
        TicketDrillDownRowData | ConvertDrillDownRowData
    >
}) => {
    const {isFetching, totalResults} = useDataHook(metricData)
    const objectType = getObjectType(metricData)
    const resultsPlaceholder = `Fetching ${objectType}...`

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
                    ? resultsPlaceholder
                    : getTheInfoLabel(totalResults, objectType)}
            </div>
            <DrillDownDownloadButton
                metricData={metricData}
                objectType={objectType}
            />
        </div>
    )
}
