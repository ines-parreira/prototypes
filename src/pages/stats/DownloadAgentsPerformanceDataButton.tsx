import React from 'react'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {saveReport} from 'services/reporting/agentsPerformanceReportingService'
import {useAgentsMetrics} from 'hooks/reporting/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'

const DOWNLOAD_DATA_BUTTON_LABEL = 'Download data'
const DOWNLOAD_BUTTON_TITLE = 'Download Agents Performance Data'

export const DownloadAgentsPerformanceDataButton = () => {
    const {reportData, isLoading, period} = useAgentsMetrics()
    const {summaryData, isLoading: summaryIsLoading} = useAgentsSummaryMetrics()

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () =>
                await saveReport(reportData, summaryData, period)
            }
            isDisabled={isLoading || summaryIsLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        >
            <ButtonIconLabel icon="file_download">
                {DOWNLOAD_DATA_BUTTON_LABEL}
            </ButtonIconLabel>
        </Button>
    )
}
