import { logEvent, SegmentEvent } from '@repo/logging'

import { Box, Button } from '@gorgias/axiom'

import { useDownloadOrderManagementData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadOrderManagementData'
import { saveFileAsDownloaded } from 'utils/file'

import css from './DownloadOrderManagementButton.less'

export const DownloadOrderManagementButton = () => {
    const { files, fileName, isLoading } = useDownloadOrderManagementData()

    return (
        <Box className={css.buttonWrapper}>
            <Button
                onClick={async () => {
                    logEvent(SegmentEvent.StatDownloadClicked, {
                        name: 'ai-agent_overview_order-management-table',
                    })
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
