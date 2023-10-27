import React from 'react'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {getCustomFieldsOrder} from 'state/ui/stats/ticketInsightsSlice'
import {formatDates} from 'pages/stats/CustomFieldsTicketCountBreakdownTable'
import {getPeriodDateTimes} from 'hooks/reporting/useTimeSeries'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {saveReport} from 'services/reporting/ticketFieldsReportingService'
import {getFilterDateRange} from 'utils/reporting'

export const DOWNLOAD_DATA_BUTTON_LABEL = 'Download data'
const DOWNLOAD_BUTTON_TITLE = 'Download Ticket Fields Data'

export const DownloadTicketFieldsDataButton = ({
    selectedCustomFieldId,
}: {
    selectedCustomFieldId: number
}) => {
    const {cleanStatsFilters, userTimezone, granularity} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const order = useAppSelector(getCustomFieldsOrder)
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(cleanStatsFilters),
        granularity
    )
    const {data: timeSeriesData, isLoading} =
        useCustomFieldsTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            String(selectedCustomFieldId)
        )

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })

                await saveReport(
                    timeSeriesData,
                    dateTimes.map((item) => formatDates(granularity, item)),
                    cleanStatsFilters.period,
                    order.direction
                )
            }}
            title={DOWNLOAD_BUTTON_TITLE}
            disabled={isLoading}
        >
            <ButtonIconLabel icon="file_download">
                {DOWNLOAD_DATA_BUTTON_LABEL}
            </ButtonIconLabel>
        </Button>
    )
}
