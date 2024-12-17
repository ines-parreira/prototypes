import React, {useEffect} from 'react'

import {VoiceRecordingsContext} from './VoiceRecordingsContext'

export default function VoiceRecordingsProvider({
    children,
    voiceCallId = null,
}: {
    children: React.ReactNode
    voiceCallId?: number | null
}) {
    const [openedRecordings, setOpenedRecordings] = React.useState<number[]>(
        voiceCallId ? [voiceCallId] : []
    )
    const [closedTranscriptions, setClosedTranscriptions] = React.useState<
        number[]
    >([])

    useEffect(() => {
        if (voiceCallId && !openedRecordings.includes(voiceCallId)) {
            setOpenedRecordings([...openedRecordings, voiceCallId])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [voiceCallId])

    const toggleResourceOpened = (
        resourceId: number,
        setFn: React.Dispatch<React.SetStateAction<number[]>>
    ) => {
        setFn((prev) =>
            prev.includes(resourceId)
                ? prev.filter((id) => id !== resourceId)
                : [...prev, resourceId]
        )
    }

    const toggleRecordingOpened = (id: number) =>
        toggleResourceOpened(id, setOpenedRecordings)

    const toggleTranscriptionOpened = (id: number) =>
        toggleResourceOpened(id, setClosedTranscriptions)

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
