import { renderHook } from '@testing-library/react'

import { mockTicketMessageTranslation } from '@gorgias/helpdesk-mocks'

import { useTicketMessageTranslation } from '../useTicketMessageTranslation'
import { useTicketMessageTranslations } from '../useTicketMessageTranslations'

jest.mock('../useTicketMessageTranslations')

const mockUseTicketMessageTranslations =
    useTicketMessageTranslations as jest.MockedFunction<
        typeof useTicketMessageTranslations
    >

const ticketMessageTranslation = mockTicketMessageTranslation()
describe('useTicketMessageTranslation', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return false when messageId is not provided', () => {
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {
                123: ticketMessageTranslation,
            },
        })

        const { result } = renderHook(() =>
            useTicketMessageTranslation({
                ticketId: 1,
                messageId: undefined,
            }),
        )

        expect(result.current).toBe(undefined)
    })

    it('should return false when messageId is not in the translation map', () => {
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {
                123: ticketMessageTranslation,
            },
        })

        const { result } = renderHook(() =>
            useTicketMessageTranslation({
                ticketId: 1,
                messageId: 456,
            }),
        )

        expect(result.current).toBe(undefined)
    })

    it('should return true when messageId exists in the translation map', () => {
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {
                123: ticketMessageTranslation,
            },
        })

        const { result } = renderHook(() =>
            useTicketMessageTranslation({
                ticketId: 1,
                messageId: 123,
            }),
        )

        expect(result.current).toBe(ticketMessageTranslation)
    })

    it('should handle empty translation map', () => {
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {},
        })

        const { result } = renderHook(() =>
            useTicketMessageTranslation({
                ticketId: 1,
                messageId: 123,
            }),
        )

        expect(result.current).toBe(undefined)
    })

    it('should handle undefined ticketId by passing 0 to useTicketMessageTranslations', () => {
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {},
        })

        renderHook(() =>
            useTicketMessageTranslation({
                ticketId: undefined,
                messageId: 123,
            }),
        )

        expect(mockUseTicketMessageTranslations).toHaveBeenCalledWith({
            ticket_id: 0,
        })
    })

    it('should handle null ticketId by passing 0 to useTicketMessageTranslations', () => {
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {},
        })

        renderHook(() =>
            useTicketMessageTranslation({
                ticketId: null as any,
                messageId: 123,
            }),
        )

        expect(mockUseTicketMessageTranslations).toHaveBeenCalledWith({
            ticket_id: 0,
        })
    })

    it('should pass the correct ticketId to useTicketMessageTranslations', () => {
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {},
        })

        renderHook(() =>
            useTicketMessageTranslation({
                ticketId: 42,
                messageId: 123,
            }),
        )

        expect(mockUseTicketMessageTranslations).toHaveBeenCalledWith({
            ticket_id: 42,
        })
    })

    it('should memoize the result based on messageId and translation map', () => {
        const translationMap = {
            123: ticketMessageTranslation,
        }

        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: translationMap,
        })

        const { result, rerender } = renderHook(
            ({ ticketId, messageId }) =>
                useTicketMessageTranslation({
                    ticketId,
                    messageId,
                }),
            {
                initialProps: {
                    ticketId: 1,
                    messageId: 123,
                },
            },
        )

        const firstResult = result.current

        // Rerender with same props
        rerender({ ticketId: 1, messageId: 123 })

        expect(result.current).toBe(firstResult)
    })

    it('should update result when messageId changes', () => {
        const translationMap = {
            123: ticketMessageTranslation,
        }

        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: translationMap,
        })

        const { result, rerender } = renderHook(
            ({ ticketId, messageId }) =>
                useTicketMessageTranslation({
                    ticketId,
                    messageId,
                }),
            {
                initialProps: {
                    ticketId: 1,
                    messageId: 123,
                },
            },
        )

        expect(result.current).toBe(ticketMessageTranslation)

        // Change to a messageId not in the map
        rerender({ ticketId: 1, messageId: 456 })

        expect(result.current).toBe(undefined)

        // Change to undefined messageId
        // @ts-expect-error - messageId is optional
        rerender({ ticketId: 1 })

        expect(result.current).toBe(undefined)
    })

    it('should update result when translation map changes', () => {
        const initialTranslationMap = {
            123: ticketMessageTranslation,
        }

        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: initialTranslationMap,
        })

        const { result, rerender } = renderHook(() =>
            useTicketMessageTranslation({
                ticketId: 1,
                messageId: 456,
            }),
        )

        expect(result.current).toBe(undefined)

        const newTranslation = {
            ...ticketMessageTranslation,
            id: '2',
            message_id: 456,
        }
        // Update the translation map to include messageId 456
        mockUseTicketMessageTranslations.mockReturnValue({
            ticketMessagesTranslationMap: {
                ...initialTranslationMap,
                456: newTranslation,
            },
        })

        rerender()

        expect(result.current).toBe(newTranslation)
    })
})
