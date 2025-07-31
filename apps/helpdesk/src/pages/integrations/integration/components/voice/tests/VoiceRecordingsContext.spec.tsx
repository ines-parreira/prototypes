import { renderHook } from '@repo/testing'

import { useVoiceRecordingsContext } from 'pages/common/hooks/useVoiceRecordingsContext'

describe('VoiceRecordingsContext', () => {
    it('should provide the correct initial state', () => {
        const { result } = renderHook(() => useVoiceRecordingsContext())

        expect(result.current.closedTranscriptions).toEqual([])
        expect(result.current.openedRecordings).toEqual([])
        expect(result.current.isRecordingOpened(1)).toBe(false)
        expect(result.current.isTranscriptionOpened(1)).toBe(true)
    })
})
