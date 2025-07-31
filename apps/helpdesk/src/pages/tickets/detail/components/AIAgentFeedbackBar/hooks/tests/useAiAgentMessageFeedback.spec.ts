import { renderHook } from '@repo/testing'

import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { getSelectedAIMessage } from 'state/ui/ticketAIAgentFeedback'

import useAiAgentMessageFeedback from '../useAiAgentMessageFeedback'

jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())
jest.mock('models/aiAgentFeedback/queries', () => ({
    useGetAiAgentFeedback: jest.fn(),
}))
const useGetAiAgentFeedbackMock = useGetAiAgentFeedback as jest.Mock

jest.mock('state/ui/ticketAIAgentFeedback', () => ({
    getSelectedAIMessage: jest.fn(),
}))
const getSelectedAIMessageMock = getSelectedAIMessage as unknown as jest.Mock

describe('getMessageFeedback', () => {
    beforeEach(() => {
        getSelectedAIMessageMock.mockReturnValue(undefined)
        useGetAiAgentFeedbackMock.mockReturnValue({ data: undefined })
    })

    it('should return null if there is no selected message', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: { data: { messages: [] } },
        })
        const { result } = renderHook(() => useAiAgentMessageFeedback())
        expect(result.current).toBe(null)
    })

    it('should return null if there no ticket feedback', () => {
        getSelectedAIMessageMock.mockReturnValue({ id: 1 })
        const { result } = renderHook(() => useAiAgentMessageFeedback())
        expect(result.current).toBe(null)
    })

    it('should return the selected ticket feedback message', () => {
        const selectedMessageFeedback = { messageId: 1 }
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: { data: { messages: [selectedMessageFeedback] } },
        })
        getSelectedAIMessageMock.mockReturnValue({ id: 1 })
        const { result } = renderHook(() => useAiAgentMessageFeedback())
        expect(result.current).toBe(selectedMessageFeedback)
    })
})
