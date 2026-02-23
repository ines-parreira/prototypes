import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { saveZippedFiles } from 'utils/file'

const emptyDashboard: DashboardSchema = {
    name: 'empty',
    children: [],
    id: 0,
    analytics_filter_id: null,
    emoji: null,
}

export const useDownloadDashboardData = (
    dashboard: DashboardSchema | undefined,
) => {
    const { isLoading, files, fileName } = useDashboardData(
        dashboard ?? emptyDashboard,
    )

    const triggerDownload = useCallback(async () => {
        logEvent(SegmentEvent.StatDownloadClicked, {
            name: 'all-metrics',
            isAiAgentDashboard: false,
        })
        await saveZippedFiles(files, fileName)
    }, [fileName, files])

    return { isLoading, triggerDownload }
}
