import { logEvent, SegmentEvent } from 'common/segment'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { useCustomFieldsReportData } from 'services/reporting/ticketFieldsReportingService'
import { getCustomFieldsOrder } from 'state/ui/stats/ticketInsightsSlice'
import { saveZippedFiles } from 'utils/file'

const TICKET_FIELDS_DOWNLOAD_TITLE = 'Download Ticket Field data'

export const DownloadTicketFieldsDataButton = ({
    selectedCustomFieldId,
}: {
    selectedCustomFieldId: number
}) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()
    const order = useAppSelector(getCustomFieldsOrder)

    const { files, fileName, isLoading } = useCustomFieldsReportData(
        cleanStatsFilters,
        userTimezone,
        granularity,
        order,
        String(selectedCustomFieldId),
    )

    return (
        <DownloadDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })

                await saveZippedFiles(files, fileName)
            }}
            disabled={isLoading}
            title={TICKET_FIELDS_DOWNLOAD_TITLE}
        />
    )
}
