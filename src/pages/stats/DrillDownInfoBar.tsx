import React from 'react'
import Loader from 'pages/common/components/Loader/Loader'
import {DrillDownDownloadButton} from 'pages/stats/DrillDownDownloadButton'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {DRILLDOWN_QUERY_LIMIT} from 'utils/reporting'

import {DrillDownDataHook} from 'hooks/reporting/useDrillDownData'
import {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'
import {
    ConvertMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'
import css from 'pages/stats/DrillDownInfobar.less'

const getObjectType = (metricData: DrillDownMetric) => {
    switch (metricData.metricName) {
        case ConvertMetric.CampaignSalesCount:
            return 'orders'
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.AverageTalkTime:
        case VoiceMetric.QueueAverageWaitTime:
        case VoiceMetric.QueueAverageTalkTime:
        case VoiceAgentsMetric.AgentTotalCalls:
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
        case VoiceAgentsMetric.AgentInboundMissedCalls:
        case VoiceAgentsMetric.AgentOutboundCalls:
        case VoiceAgentsMetric.AgentAverageTalkTime:
            return 'voice calls'
        default:
            return 'tickets'
    }
}

const isMetricDataDownloadable = (metricData: DrillDownMetric): boolean => {
    switch (metricData.metricName) {
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.AverageTalkTime:
        case VoiceMetric.QueueAverageWaitTime:
        case VoiceMetric.QueueAverageTalkTime:
        case VoiceAgentsMetric.AgentTotalCalls:
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
        case VoiceAgentsMetric.AgentInboundMissedCalls:
        case VoiceAgentsMetric.AgentOutboundCalls:
        case VoiceAgentsMetric.AgentAverageTalkTime:
            return false
        default:
            return true
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
            {objectType} used to compute the metric.
        </>
    )
}

export const DrillDownInfoBar = ({
    metricData,
    useDataHook,
}: {
    metricData: DrillDownMetric
    useDataHook: DrillDownDataHook<
        | TicketDrillDownRowData
        | ConvertDrillDownRowData
        | VoiceCallDrillDownRowData
    >
}) => {
    const {isFetching, totalResults} = useDataHook(metricData)
    const objectType = getObjectType(metricData)
    const resultsPlaceholder = `Fetching ${objectType}...`
    const shouldDisplayDownloadButton = isMetricDataDownloadable(metricData)

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
            {shouldDisplayDownloadButton && (
                <DrillDownDownloadButton
                    metricData={metricData}
                    objectType={objectType}
                />
            )}
        </div>
    )
}
