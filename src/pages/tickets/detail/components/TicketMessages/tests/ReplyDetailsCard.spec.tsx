import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useGetTicketMessage } from '@gorgias/api-queries'

import ReplyDetailsCard from 'pages/tickets/detail/components/TicketMessages/ReplyDetailsCard'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

const queryClient = mockQueryClient()
const mockStore = configureMockStore()

jest.mock('@gorgias/api-queries')
const mockUseGetTicketMessage = assumeMock(useGetTicketMessage)

describe('ReplyDetailsCard', () => {
    const reply = {
        ticket_id: 1,
        ticket_message_id: 2,
    }

    it('should trigger a ticket message query', () => {
        mockUseGetTicketMessage.mockReturnValue({
            isSuccess: false,
            data: undefined,
        } as ReturnType<typeof useGetTicketMessage>)

        render(
            <QueryClientProvider client={queryClient}>
                <ReplyDetailsCard reply={reply} />
            </QueryClientProvider>,
        )

        expect(mockUseGetTicketMessage).toHaveBeenCalledWith(1, 2, {
            query: { refetchInterval: false, refetchOnWindowFocus: false },
        })
    })

    it('should not render if the details are not complete', () => {
        mockUseGetTicketMessage.mockReturnValue({
            isSuccess: true,
            data: { data: { body_text: 'reply body text' } },
        } as ReturnType<typeof useGetTicketMessage>)

        const { queryByText } = render(
            <QueryClientProvider client={queryClient}>
                <ReplyDetailsCard reply={reply} />
            </QueryClientProvider>,
        )

        expect(queryByText('reply body text')).not.toBeInTheDocument()
    })

    it('should reder the details withing an embedded card if the message is fetched', () => {
        mockUseGetTicketMessage.mockReturnValue({
            isSuccess: true,
            data: {
                data: {
                    integration_id: 1,
                    body_text: 'reply body text',
                    source: {
                        type: 'email',
                    },
                    sender: {
                        id: 123,
                        name: 'John Doe',
                    },
                },
            },
        } as ReturnType<typeof useGetTicketMessage>)

        const { getByText } = render(
            <Provider
                store={mockStore({
                    entities: {
                        rules: {},
                    },
                })}
            >
                <QueryClientProvider client={queryClient}>
                    <ReplyDetailsCard reply={reply} />
                </QueryClientProvider>
            </Provider>,
        )

        expect(getByText('reply body text')).toBeInTheDocument()
        expect(getByText('JD')).toBeInTheDocument()
    })
})
