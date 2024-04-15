import React from 'react'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'

import {logEvent, SegmentEvent} from 'common/segment'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {saveReport} from 'services/reporting/agentsPerformanceReportingService'
import {useAgentsMetrics} from 'hooks/reporting/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'

const DOWNLOAD_BUTTON_TITLE = 'Download Agents Performance Data'

export const DownloadAgentsPerformanceDataButton = () => {
    const {reportData, isLoading, period} = useAgentsMetrics()
    const {summaryData, isLoading: summaryIsLoading} = useAgentsSummaryMetrics()
    const {columnsOrder} = useAgentsTableConfigSetting()

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveReport(reportData, summaryData, columnsOrder, period)
            }}
            isDisabled={isLoading || summaryIsLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        >
            <ButtonIconLabel icon="file_download">
                {DOWNLOAD_DATA_BUTTON_LABEL}
            </ButtonIconLabel>
        </Button>
    )
}
