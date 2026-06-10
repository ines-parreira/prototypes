import { useCallback, useMemo } from 'react'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    PERFORMANCE_CHANNELS_DASHBOARD_ID,
    PerformanceChannelsQueryParams,
} from 'domains/reporting/pages/performance/channels/constants'
import { ChannelsVoiceReportConfig } from 'domains/reporting/pages/performance/channels/voice/ChannelsVoiceReportConfig'
import { DEFAULT_PERFORMANCE_CHANNELS_VOICE_LAYOUT } from 'domains/reporting/pages/performance/channels/voice/config/defaultLayoutConfig'
import { buildDashboardSchemaFromLayout } from 'domains/reporting/utils/buildDashboardSchemaFromLayout'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'performance-channels-voice'

export const useExportPerformanceChannelsVoiceToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: PERFORMANCE_CHANNELS_DASHBOARD_ID,
        defaultLayoutConfig: DEFAULT_PERFORMANCE_CHANNELS_VOICE_LAYOUT,
        tabId: PerformanceChannelsQueryParams.Voice,
    })

    const channelsVoiceDashboard = useMemo(
        () => buildDashboardSchemaFromLayout(layoutConfig, REPORT_NAME),
        [layoutConfig],
    )

    const { files, isLoading } = useDashboardData(
        channelsVoiceDashboard,
        ChannelsVoiceReportConfig.charts,
    )

    const triggerDownload = useCallback(async () => {
        const fileName = getCsvFileNameWithDates(
            cleanStatsFilters.period,
            REPORT_NAME,
        ).replace('.csv', '')
        await saveZippedFiles(files, fileName)
    }, [files, cleanStatsFilters.period])

    return {
        triggerDownload,
        isLoading,
    }
}
