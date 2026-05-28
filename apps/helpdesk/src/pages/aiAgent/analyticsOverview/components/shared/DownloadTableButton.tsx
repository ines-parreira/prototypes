import { logEvent, SegmentEvent } from '@repo/logging'

import { Button } from '@gorgias/axiom'

import { saveFileAsDownloaded } from 'utils/file'

type Props = {
    files: Record<string, string>
    fileName: string
    isLoading: boolean
    segmentEventName: string
}

export const useDownloadTableAction = ({
    files,
    fileName,
    isLoading,
    segmentEventName,
}: Props) => ({
    onClick: () => {
        logEvent(SegmentEvent.StatDownloadClicked, { name: segmentEventName })
        saveFileAsDownloaded(fileName, Object.values(files)[0], 'text/csv')
    },
    isLoading,
})

export const DownloadTableButton = ({
    files,
    fileName,
    isLoading,
    segmentEventName,
}: Props) => {
    const { onClick } = useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName,
    })
    return (
        <Button
            onClick={onClick}
            isDisabled={isLoading}
            size="sm"
            variant="tertiary"
            icon="download"
        />
    )
}
