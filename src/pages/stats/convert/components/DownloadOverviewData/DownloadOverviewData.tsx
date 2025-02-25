import React from 'react'

import { useCampaignReportData } from 'pages/stats/convert/components/DownloadOverviewData/GenerateReportService'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { saveZippedFiles } from 'utils/file'

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
