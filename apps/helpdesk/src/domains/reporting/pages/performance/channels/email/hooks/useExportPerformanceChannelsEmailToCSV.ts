import { useCallback, useMemo } from 'react'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    ChartType,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import {
    PERFORMANCE_CHANNELS_DASHBOARD_ID,
    PerformanceChannelsQueryParams,
} from 'domains/reporting/pages/performance/channels/constants'
import { ChannelsEmailReportConfig } from 'domains/reporting/pages/performance/channels/email/ChannelsEmailReportConfig'
import { DEFAULT_PERFORMANCE_CHANNELS_EMAIL_LAYOUT } from 'domains/reporting/pages/performance/channels/email/config/defaultLayoutConfig'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'performance-channels-email'

const buildChannelsEmailDashboard = (
    layout: typeof DEFAULT_PERFORMANCE_CHANNELS_EMAIL_LAYOUT,
): DashboardSchema => ({
    id: -1,
    name: REPORT_NAME,
    analytics_filter_id: null,
    emoji: null,
    children: layout.sections.map((section) => ({
        type: DashboardChildType.Section,
        children: section.items
            .filter((item) =>
                section.type === ChartType.Table ? true : item.visibility,
            )
            .map((item) => ({
                type: DashboardChildType.Chart,
                config_id: item.chartId,
                metadata: {
                    savedMeasure: item.measures?.[0],
                    savedDimension: item.dimensions?.[0],
                },
            })),
    })),
})

export const useExportPerformanceChannelsEmailToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: PERFORMANCE_CHANNELS_DASHBOARD_ID,
        defaultLayoutConfig: DEFAULT_PERFORMANCE_CHANNELS_EMAIL_LAYOUT,
        tabId: PerformanceChannelsQueryParams.Email,
    })

    const channelsEmailDashboard = useMemo(
        () => buildChannelsEmailDashboard(layoutConfig),
        [layoutConfig],
    )

    const { files, isLoading } = useDashboardData(
        channelsEmailDashboard,
        false,
        ChannelsEmailReportConfig.charts,
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
