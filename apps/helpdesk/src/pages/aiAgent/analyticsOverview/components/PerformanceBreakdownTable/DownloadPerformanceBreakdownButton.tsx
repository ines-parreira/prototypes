import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownloadPerformanceBreakdownData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData'

const SEGMENT_EVENT_NAME = 'performance-breakdown' as const

export const useDownloadPerformanceBreakdownAction = () => {
    const { files, fileName, isLoading } = useDownloadPerformanceBreakdownData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadPerformanceBreakdownButton = () => {
    const { files, fileName, isLoading } = useDownloadPerformanceBreakdownData()

    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
