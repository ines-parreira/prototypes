import { logEvent, SegmentEvent } from '@repo/logging'

import { Button } from '@gorgias/axiom'

import { saveFileAsDownloaded } from 'utils/file'

type Props = {
    files: Record<string, string>
    fileName: string
    isLoading: boolean
    segmentEventName: string
}

export const DownloadTableButton = ({
    files,
    fileName,
    isLoading,
    segmentEventName,
}: Props) => (
    <Button
        onClick={() => {
            logEvent(SegmentEvent.StatDownloadClicked, {
                name: segmentEventName,
            })
            const csvContent = Object.values(files)[0]
            saveFileAsDownloaded(fileName, csvContent, 'text/csv')
        }}
        isDisabled={isLoading}
        size="sm"
        variant="tertiary"
        icon="download"
    />
)
