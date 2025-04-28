import { useVoiceRecordingsContext } from 'pages/common/hooks/useVoiceRecordingsContext'
import { renderHook } from 'utils/testing/renderHook'

describe('VoiceRecordingsContext', () => {
    it('should provide the correct initial state', () => {
        const { result } = renderHook(() => useVoiceRecordingsContext())

        expect(result.current.closedTranscriptions).toEqual([])
        expect(result.current.openedRecordings).toEqual([])
        expect(result.current.isRecordingOpened(1)).toBe(false)
        expect(result.current.isTranscriptionOpened(1)).toBe(true)
    })
})
