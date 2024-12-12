import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {useAutoQAMetrics} from 'hooks/reporting/support-performance/auto-qa/useAutoQAMetrics'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {
    AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER,
    AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER_WITH_LANGUAGE,
    AUTO_QA_AGENTS_TABLE_MANUAL_DIMENSIONS_COLUMNS,
} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {saveReport} from 'services/reporting/autoQAReportingService'

const DOWNLOAD_BUTTON_TITLE = 'AutoQA Report Data'

export const AutoQADownloadDataButton = () => {
    const {reportData, isLoading, period} = useAutoQAMetrics()
    const isAutoQaLanguageProficiency =
        !!useFlags()[FeatureFlagKey.AutoQaLanguageProficiency]
    const isAutoQaManualDimensions =
        !!useFlags()[FeatureFlagKey.AutoQaManualDimensions]

    const tableColumnsLanguage = isAutoQaLanguageProficiency
        ? AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER_WITH_LANGUAGE
        : AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER

    const tableColumns = isAutoQaManualDimensions
        ? [
              ...tableColumnsLanguage,
              ...AUTO_QA_AGENTS_TABLE_MANUAL_DIMENSIONS_COLUMNS,
          ]
        : tableColumnsLanguage

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveReport(reportData, tableColumns, period)
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
