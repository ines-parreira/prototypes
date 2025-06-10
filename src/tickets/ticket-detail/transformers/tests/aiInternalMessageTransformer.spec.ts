import { isAIAgentMessage } from '../../helpers/isAIAgentMessage'
import type { TicketElement } from '../../types'
import { aiInternalMessageTransformer } from '../aiInternalMessageTransformer'

jest.mock('../../helpers/isAIAgentMessage', () => ({
    isAIAgentMessage: jest.fn(),
}))

const mockIsAIAgentMessage = isAIAgentMessage as jest.MockedFunction<
    typeof isAIAgentMessage
>

describe('aiInternalMessageTransformer', () => {
    beforeEach(() => {
        mockIsAIAgentMessage.mockReturnValue(true)
    })

    it('should not filter non-message elements', () => {
        const elements = [
            { type: 'event', data: {} },
            { type: 'ai-event', data: {} },
        ] as TicketElement[]

        const result = aiInternalMessageTransformer(elements)

        expect(result).toEqual(elements)
        expect(mockIsAIAgentMessage).not.toHaveBeenCalled()
    })

    it('should not filter messages from non AI elements', () => {
        mockIsAIAgentMessage.mockReturnValue(false)

        const elements = [
            {
                type: 'message',
                data: {
                    public: false,
                },
            },
        ] as TicketElement[]

        const result = aiInternalMessageTransformer(elements)

        expect(result).toEqual(elements)
        expect(mockIsAIAgentMessage).toHaveBeenCalledWith(elements[0].data)
    })

    it('should keep public AI agent messages', () => {
        const elements = [
            {
                type: 'message',
                data: {
                    public: true,
                },
            },
        ] as TicketElement[]

        const result = aiInternalMessageTransformer(elements)

        expect(result).toEqual(elements)
        expect(mockIsAIAgentMessage).toHaveBeenCalledWith(elements[0].data)
    })

    it('should filter out internal AI agent messages', () => {
        const elements = [
            {
                type: 'message',
                data: {
                    public: false,
                },
            },
        ] as TicketElement[]

        const result = aiInternalMessageTransformer(elements)

        expect(result).toEqual([])
        expect(mockIsAIAgentMessage).toHaveBeenCalledWith(elements[0].data)
    })

    it('should filter only internal AI messages in mixed list', () => {
        // Set up mock to return different values for different calls
        mockIsAIAgentMessage
            .mockReturnValueOnce(false) // Regular user message
            .mockReturnValueOnce(true) // AI agent public message
            .mockReturnValueOnce(true) // AI agent internal message

        const elements = [
            // Regular user message - should keep
            {
                type: 'message',
                data: {
                    public: false,
                },
            },
            // AI agent public message - should keep
            {
                type: 'message',
                data: {
                    public: true,
                },
            },
            // AI agent internal message - should filter out
            {
                type: 'message',
                data: {
                    public: false,
                },
            },
            // Non-message element - should keep
            { type: 'event', data: {} },
        ] as TicketElement[]

        const result = aiInternalMessageTransformer(elements)

        expect(result).toEqual([
            elements[0], // Regular user message
            elements[1], // AI agent public message
            // elements[2] filtered out
            elements[3], // Event
        ])
    })

    it('should handle empty array', () => {
        const elements = [] as TicketElement[]
        const result = aiInternalMessageTransformer(elements)

        expect(result).toEqual([])
        expect(mockIsAIAgentMessage).not.toHaveBeenCalled()
    })

    it('should handle AI agent messages with undefined public property', () => {
        const elements = [
            {
                type: 'message',
                data: {
                    // public property is undefined (falsy)
                },
            },
        ] as TicketElement[]

        const result = aiInternalMessageTransformer(elements)

        expect(result).toEqual([]) // Should be filtered out
        expect(mockIsAIAgentMessage).toHaveBeenCalledWith(elements[0].data)
    })

    it('should handle AI agent messages with falsy public values', () => {
        mockIsAIAgentMessage.mockReturnValue(true)

        const elements = [
            {
                type: 'message',
                data: {
                    public: null,
                },
            },
        ] as unknown as TicketElement[]

        const result = aiInternalMessageTransformer(elements)

        expect(result).toEqual([]) // Should be filtered out
        expect(mockIsAIAgentMessage).toHaveBeenCalledWith(elements[0].data)
    })
})
