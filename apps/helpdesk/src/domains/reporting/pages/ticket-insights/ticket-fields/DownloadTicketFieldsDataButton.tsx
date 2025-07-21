import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { useCustomFieldsReportData } from 'domains/reporting/services/ticketFieldsReportingService'

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
