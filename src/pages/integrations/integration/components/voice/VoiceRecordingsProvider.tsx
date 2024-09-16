import React from 'react'
import {VoiceRecordingsContext} from './VoiceRecordingsContext'

export default function VoiceRecordingsProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [openedRecordings, setOpenedRecordings] = React.useState<number[]>([])
    const [closedTranscriptions, setClosedTranscriptions] = React.useState<
        number[]
    >([])
    const toggleRecordingOpened = (recordingId: number) => {
        setOpenedRecordings((prev) =>
            prev.includes(recordingId)
                ? prev.filter((id) => id !== recordingId)
                : [...prev, recordingId]
        )
    }
    const toggleTranscriptionOpened = (transcriptionId: number) => {
        setClosedTranscriptions((prev) =>
            prev.includes(transcriptionId)
                ? prev.filter((id) => id !== transcriptionId)
                : [...prev, transcriptionId]
        )
    }

    return (
        <VoiceRecordingsContext.Provider
            value={{
                openedRecordings,
                closedTranscriptions,
                toggleRecordingOpened,
                toggleTranscriptionOpened,
                isRecordingOpened: (callId: number) =>
                    openedRecordings.includes(callId),
                isTranscriptionOpened: (recordingId: number) =>
                    !closedTranscriptions.includes(recordingId),
            }}
        >
            {children}
        </VoiceRecordingsContext.Provider>
    )
}
