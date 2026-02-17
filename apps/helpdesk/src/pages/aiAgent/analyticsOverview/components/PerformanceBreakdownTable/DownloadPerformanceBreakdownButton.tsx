import { logEvent, SegmentEvent } from '@repo/logging'
import { saveFileAsDownloaded } from '@repo/utils'

import { Box, Button } from '@gorgias/axiom'

import { useDownloadPerformanceBreakdownData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData'

import css from './DownloadPerformanceBreakdownButton.less'

export const DownloadPerformanceBreakdownButton = () => {
    const { files, fileName, isLoading } = useDownloadPerformanceBreakdownData()

    return (
        <Box className={css.buttonWrapper}>
            <Button
                onClick={async () => {
                    logEvent(SegmentEvent.StatDownloadClicked, {
                        name: 'performance-breakdown',
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
