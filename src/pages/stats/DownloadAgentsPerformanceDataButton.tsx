import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {FeatureFlagKey} from 'config/featureFlags'

import {logEvent, SegmentEvent} from 'common/segment'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {saveReport} from 'services/reporting/agentsPerformanceReportingService'
import {useAgentsMetrics} from 'hooks/reporting/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'

export const DOWNLOAD_DATA_BUTTON_LABEL = 'Download data'
const DOWNLOAD_BUTTON_TITLE = 'Download Agents Performance Data'

export const DownloadAgentsPerformanceDataButton = () => {
    const {reportData, isLoading, period} = useAgentsMetrics()
    const {summaryData, isLoading: summaryIsLoading} = useAgentsSummaryMetrics()
    const {columnsOrder} = useAgentsTableConfigSetting()
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveReport(
                    reportData,
                    summaryData,
                    columnsOrder,
                    !!isAnalyticsNewCubes,
                    period
                )
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
