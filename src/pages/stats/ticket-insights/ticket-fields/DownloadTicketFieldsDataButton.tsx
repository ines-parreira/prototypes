import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { useCustomFieldsReportData } from 'services/reporting/ticketFieldsReportingService'

const TICKET_FIELDS_DOWNLOAD_TITLE = 'Download Ticket Field data'

export const DownloadTicketFieldsDataButton = ({
    selectedCustomFieldId,
}: {
    selectedCustomFieldId: number
}) => {
    const { download, isLoading } = useCustomFieldsReportData(
        selectedCustomFieldId,
    )

    return (
        <DownloadDataButton
            onClick={download}
            disabled={isLoading}
            title={TICKET_FIELDS_DOWNLOAD_TITLE}
        />
    )
}
