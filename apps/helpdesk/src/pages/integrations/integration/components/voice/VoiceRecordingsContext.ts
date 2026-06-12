import { createContext } from 'react'
import { noop } from '@gorgias/toolkit'

export type VoiceRecordingsContextState = {
    openedRecordings: number[]
    toggleRecordingOpened: (callId: number) => void
    closedTranscriptions: number[]
    toggleTranscriptionOpened: (recordingId: number) => void
    isRecordingOpened: (recordingId: number) => boolean
    isTranscriptionOpened: (recordingId: number) => boolean
}

export const VoiceRecordingsContext =
    createContext<VoiceRecordingsContextState>({
        openedRecordings: [],
        closedTranscriptions: [],
        toggleRecordingOpened: noop,
        toggleTranscriptionOpened: noop,
        isRecordingOpened: () => false,
        isTranscriptionOpened: () => true,
    })
