import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useAutoQAMetrics} from 'hooks/reporting/support-performance/auto-qa/useAutoQAMetrics'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {saveReport} from 'services/reporting/autoQAReportingService'

const DOWNLOAD_BUTTON_TITLE = 'Channels Report Data'

export const AutoQADownloadDataButton = () => {
    const {reportData, isLoading, period} = useAutoQAMetrics()

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
                    AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER,
                    period
                )
            }}
            isDisabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        >
            <ButtonIconLabel icon="file_download">
                {DOWNLOAD_DATA_BUTTON_LABEL}
            </ButtonIconLabel>
        </Button>
    )
}
