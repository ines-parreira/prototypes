import { saveZippedFiles } from '@repo/utils'

import { useCampaignReportData } from 'domains/reporting/pages/convert/components/DownloadOverviewData/GenerateReportService'
import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'

const CAMPAIGNS_REPORT_DOWNLOAD_DATA_BUTTON_LABEL =
    'Download Performance Overview Data'

const DownloadOverviewData = () => {
    const { files, fileName, isLoading } = useCampaignReportData()

    const onClick = async () => {
        await saveZippedFiles(files, fileName)
    }

    return (
        <DownloadDataButton
            onClick={onClick}
            disabled={isLoading}
            title={CAMPAIGNS_REPORT_DOWNLOAD_DATA_BUTTON_LABEL}
        />
    )
}

export default DownloadOverviewData
