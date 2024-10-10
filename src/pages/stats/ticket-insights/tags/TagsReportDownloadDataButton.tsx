import React from 'react'
import {useTicketCountPerTag} from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'

import {logEvent, SegmentEvent} from 'common/segment'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {formatDates} from 'pages/stats/utils'
import {saveReport} from 'services/reporting/tagsReportingService'

const DOWNLOAD_BUTTON_TITLE = 'Download Tags Data'

export const TagsReportDownloadDataButton = () => {
    const {
        data: ticketCountPerTagData,
        dateTimes,
        isLoading,
        cleanStatsFilters,
        granularity,
    } = useTicketCountPerTag()
    const formattedDateTimes = dateTimes.map((item) =>
        formatDates(granularity, item)
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
                    ticketCountPerTagData,
                    formattedDateTimes,
                    cleanStatsFilters.period
                )
            }}
            title={DOWNLOAD_BUTTON_TITLE}
            isDisabled={isLoading}
        >
            <ButtonIconLabel icon="file_download">
                {DOWNLOAD_DATA_BUTTON_LABEL}
            </ButtonIconLabel>
        </Button>
    )
}
