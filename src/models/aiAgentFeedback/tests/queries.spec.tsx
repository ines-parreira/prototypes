import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useGetAiAgentFeedback} from '../queries'
import {getAIAgentTicketMessagesFeedback} from '../resources'

jest.mock('../resources', () => ({
    getAIAgentTicketMessagesFeedback: jest.fn(),
}))

const queryClient = mockQueryClient()

const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useGetAiAgentFeedback', () => {
    it('should call getAIAgentTicketMessagesFeedback with the correct ticketId', async () => {
        const ticketId = 123
        const mockFeedback = [
            {messageId: 1, feedback: 1},
            {messageId: 2, feedback: -1},
        ]
        ;(getAIAgentTicketMessagesFeedback as jest.Mock).mockResolvedValue(
            mockFeedback
        )

        const {result, waitForNextUpdate} = renderHook(
            () => useGetAiAgentFeedback(ticketId),
            {wrapper}
        )

        expect(result.current.isLoading).toBe(true)

        await waitForNextUpdate()

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBe(mockFeedback)
        expect(getAIAgentTicketMessagesFeedback).toHaveBeenCalledWith(ticketId)
    })
})
