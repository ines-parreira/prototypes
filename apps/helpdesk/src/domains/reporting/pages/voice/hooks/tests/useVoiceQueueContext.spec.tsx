import { ReactNode } from 'react'

import { VoiceQueueContext } from 'domains/reporting/pages/voice/components/VoiceQueue/VoiceQueueContext'
import { useVoiceQueueContext } from 'domains/reporting/pages/voice/hooks/useVoiceQueueContext'
import { renderHook } from 'utils/testing/renderHook'

describe('useVoiceQueueContext', () => {
    it('should throw an error if used outside of VoiceQueueProvider', () => {
        expect(() => renderHook(() => useVoiceQueueContext())).toThrow(
            'useVoiceQueueContext must be used within a VoiceQueueProvider',
        )
    })

    it('should return the context value when used within VoiceQueueProvider', () => {
        const mockContextValue = {
            getQueueFromId: jest.fn(),
        }

        const wrapper = ({ children }: { children?: ReactNode }) => {
            return (
                <VoiceQueueContext.Provider value={mockContextValue}>
                    {children}
                </VoiceQueueContext.Provider>
            )
        }

        const { result } = renderHook(() => useVoiceQueueContext(), {
            wrapper,
        })

        expect(result.current).toBe(mockContextValue)
    })
})
