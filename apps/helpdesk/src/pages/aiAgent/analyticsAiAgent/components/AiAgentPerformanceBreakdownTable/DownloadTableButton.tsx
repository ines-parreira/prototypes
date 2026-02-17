import { logEvent, SegmentEvent } from '@repo/logging'
import { saveFileAsDownloaded } from '@repo/utils'

import { Box, Button } from '@gorgias/axiom'

import {
    ExportFormat,
    useAiAgentAnalyticsDashboardTracking,
} from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'

import css from './DownloadTableButton.less'

type DownloadTableButtonProps = {
    files: Record<string, string>
    fileName: string
    isLoading: boolean
    tableName: string
}

export const DownloadTableButton = ({
    files,
    fileName,
    isLoading,
    tableName,
}: DownloadTableButtonProps) => {
    const { onExport } = useAiAgentAnalyticsDashboardTracking()

    return (
        <Box className={css.buttonWrapper}>
            <Button
                onClick={async () => {
                    logEvent(SegmentEvent.StatDownloadClicked, {
                        name: tableName,
                    })
                    onExport({ format: ExportFormat.CSV })
                    const csvContent = Object.values(files)[0]
                    saveFileAsDownloaded(fileName, csvContent, 'text/csv')
                }}
                isDisabled={isLoading}
                size="sm"
                variant="tertiary"
                icon="download"
            />
        </Box>
    )
}
