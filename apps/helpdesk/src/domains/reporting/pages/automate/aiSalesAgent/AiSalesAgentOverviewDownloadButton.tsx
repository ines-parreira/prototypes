import { logEvent, SegmentEvent } from '@repo/logging'
import { saveZippedFiles } from '@repo/utils'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAiSalesAgentOverviewReportData from 'domains/reporting/pages/automate/aiSalesAgent/hooks/aiSalesAgentReportingService'

export const DOWNLOAD_DATA_BUTTON_LABEL = 'Download Data'

const AiSalesAgentOverviewDownloadButton = () => {
    const { files, fileName, isLoading } = useAiSalesAgentOverviewReportData()

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveZippedFiles(files, fileName)
            }}
            title={DOWNLOAD_DATA_BUTTON_LABEL}
            isLoading={isLoading}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}

export default AiSalesAgentOverviewDownloadButton
