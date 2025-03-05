import { useCallback } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { useCustomReportData } from 'hooks/reporting/custom-reports/useCustomReportData'
import { CustomReportSchema } from 'pages/stats/custom-reports/types'
import { saveZippedFiles } from 'utils/file'

const emptyCustomReport: CustomReportSchema = {
    name: 'empty',
    children: [],
    id: 0,
    analytics_filter_id: null,
    emoji: null,
}

export const useDownloadCustomReportData = (
    customReport: CustomReportSchema | undefined,
) => {
    const { isLoading, files, fileName } = useCustomReportData(
        customReport ?? emptyCustomReport,
    )

    const triggerDownload = useCallback(async () => {
        logEvent(SegmentEvent.StatDownloadClicked, {
            name: 'all-metrics',
        })
        await saveZippedFiles(files, fileName)
    }, [fileName, files])

    return { isLoading, triggerDownload }
}
