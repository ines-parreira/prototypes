import React from 'react'
import {render} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {useGetTicketMessage} from '@gorgias/api-queries'
import MetaRepliedByLabel from 'pages/tickets/detail/components/TicketMessages/MetaRepliedByLabel'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

const queryClient = mockQueryClient()

jest.mock('@gorgias/api-queries', () => ({
    useGetTicketMessage: jest.fn(),
}))
const mockUseGetTicketMessage = assumeMock(useGetTicketMessage)

describe('MetaRepliedByLabel', () => {
    const reply = {
        ticket_id: 1,
        ticket_message_id: 2,
    }

    it('should trigger a ticket message query and display a loading indicator', () => {
        mockUseGetTicketMessage.mockReturnValue({
            isLoading: true,
            data: undefined,
        } as ReturnType<typeof useGetTicketMessage>)

        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <MetaRepliedByLabel reply={reply} />
            </QueryClientProvider>
        )

        expect(mockUseGetTicketMessage).toHaveBeenCalledWith(1, 2, {
            query: {refetchInterval: false, refetchOnWindowFocus: false},
        })

        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should display the reply details once the ticket message has been loaded', () => {
        mockUseGetTicketMessage.mockReturnValue({
            isLoading: false,
            data: {
                data: {
                    sender: {name: 'John Doe'},
                },
            },
        } as ReturnType<typeof useGetTicketMessage>)

        const {queryByText} = render(
            <QueryClientProvider client={queryClient}>
                <MetaRepliedByLabel reply={reply} />
            </QueryClientProvider>
        )

        expect(queryByText('Loading...')).not.toBeInTheDocument()
        expect(queryByText('responded to via Messenger')).toBeInTheDocument()
        expect(queryByText('John Doe')).toBeInTheDocument()
        expect(queryByText('View ticket')).toBeInTheDocument()
        expect(queryByText('View ticket')).toHaveAttribute('href', '1')
    })
})
