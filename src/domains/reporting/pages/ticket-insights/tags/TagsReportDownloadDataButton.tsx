import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { useDownloadTagsReportData } from 'domains/reporting/services/tagsReportingService'

const DOWNLOAD_BUTTON_TITLE = 'Download Tags Data'

export const TagsReportDownloadDataButton = () => {
    const { download, isLoading } = useDownloadTagsReportData()

    return (
        <DownloadDataButton
            onClick={download}
            disabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        />
    )
}
