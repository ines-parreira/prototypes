import { ReactNode } from 'react'

import { renderHook } from 'utils/testing/renderHook'

import { VoiceQueueContext } from '../../components/VoiceQueue/VoiceQueueContext'
import { useVoiceQueueContext } from '../useVoiceQueueContext'

describe('useVoiceQueueContext', () => {
    it('should throw an error if used outside of VoiceQueueProvider', () => {
        const { result } = renderHook(() => useVoiceQueueContext())

        expect(result.error).toEqual(
            new Error(
                'useVoiceQueueContext must be used within a VoiceQueueProvider',
            ),
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
