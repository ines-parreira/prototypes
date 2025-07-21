import { createContext } from 'react'

import _noop from 'lodash/noop'

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
        toggleRecordingOpened: _noop,
        toggleTranscriptionOpened: _noop,
        isRecordingOpened: () => false,
        isTranscriptionOpened: () => true,
    })
