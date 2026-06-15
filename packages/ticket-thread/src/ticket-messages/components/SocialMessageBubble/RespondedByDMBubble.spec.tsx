import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetCustomerHandler,
    mockGetTicketHandler,
    mockGetTicketMessageHandler,
    mockGetUserAvailabilityHandler,
    mockGetUserHandler,
    mockTicket,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import { useTicketThreadDateTimeFormat } from '../../../shared/hooks/useTicketThreadDateTimeFormat'
import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { RespondedByDMBubble } from './RespondedByDMBubble'

vi.mock('../../../shared/hooks/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

const mockUseTicketThreadDateTimeFormat = vi.mocked(
    useTicketThreadDateTimeFormat,
)

const sender = {
    id: 10,
    name: 'Agent Smith',
    firstname: 'Agent',
    lastname: 'Smith',
    email: 'agent@example.com',
    meta: null,
}

const defaultProps = {
    channel: 'Instagram Direct Message',
    channelIcon: 'channel-instagram-dm',
    ticketId: 100,
    ticketMessageId: 200,
}

function givenMessageData(
    overrides: Partial<{
        sent_datetime: string | null
        opened_datetime: string | null
        failed_datetime: string | null
        created_datetime: string | null
    }> = {},
) {
    server.use(
        mockGetTicketMessageHandler(async () =>
            HttpResponse.json(
                mockTicketMessage({
                    sender,
                    body_text: null,
                    channel: 'instagram-direct-message',
                    created_datetime: '2024-03-21T11:00:00Z',
                    sent_datetime: null,
                    opened_datetime: null,
                    failed_datetime: null,
                    ...overrides,
                } as any),
            ),
        ).handler,
    )
}

beforeEach(() => {
    vi.clearAllMocks()
    server.use(
        getCurrentUserHandler().handler,
        mockGetUserHandler().handler,
        mockGetTicketHandler(async ({ params }) =>
            HttpResponse.json(mockTicket({ id: Number(params?.id ?? 1) })),
        ).handler,
        mockGetCustomerHandler().handler,
        mockGetTicketMessageHandler(async () => HttpResponse.json(null))
            .handler,
        mockGetUserAvailabilityHandler().handler,
    )
    mockUseTicketThreadDateTimeFormat.mockReturnValue({
        format: { relative: 'YYYY-MM-DD', compact: 'YYYY-MM-DD HH:mm' },
        timezone: undefined,
    })
})

describe('RespondedByDMBubble', () => {
    it('always shows the "replied via" label', () => {
        render(<RespondedByDMBubble {...defaultProps} />)

        expect(
            screen.getByText('replied via Instagram Direct Message'),
        ).toBeInTheDocument()
    })

    it('does not show a header when message data is not loaded', () => {
        render(<RespondedByDMBubble {...defaultProps} />)

        expect(screen.queryByText('Agent Smith')).not.toBeInTheDocument()
    })

    describe('when message data is loaded', () => {
        beforeEach(() => {
            givenMessageData()
        })

        it('shows the sender name', async () => {
            render(<RespondedByDMBubble {...defaultProps} />)

            expect(await screen.findByText('Agent Smith')).toBeInTheDocument()
        })

        it('shows the timestamp when created_datetime is set', async () => {
            render(<RespondedByDMBubble {...defaultProps} />)

            expect(await screen.findByText('2024-03-21')).toBeInTheDocument()
        })

        it('shows no delivery icon when no delivery timestamp is set', async () => {
            render(<RespondedByDMBubble {...defaultProps} />)

            await screen.findByText('Agent Smith')
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(3)
        })

        it('shows a sent icon when only sent_datetime is set', async () => {
            givenMessageData({ sent_datetime: '2024-03-21T11:00:00Z' })

            render(<RespondedByDMBubble {...defaultProps} />)

            await screen.findByText('Agent Smith')
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })

        it('shows a read icon when opened_datetime is set', async () => {
            givenMessageData({
                sent_datetime: '2024-03-21T11:00:00Z',
                opened_datetime: '2024-03-21T12:00:00Z',
            })

            render(<RespondedByDMBubble {...defaultProps} />)

            await screen.findByText('Agent Smith')
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })

        it('shows a failed icon when failed_datetime is set', async () => {
            givenMessageData({ failed_datetime: '2024-03-21T11:00:00Z' })

            render(<RespondedByDMBubble {...defaultProps} />)

            await screen.findByText('Agent Smith')
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })

        it('shows only the failed icon when both failed_datetime and sent_datetime are set', async () => {
            givenMessageData({
                sent_datetime: '2024-03-21T11:00:00Z',
                failed_datetime: '2024-03-21T11:05:00Z',
            })

            render(<RespondedByDMBubble {...defaultProps} />)

            await screen.findByText('Agent Smith')
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })

        it('shows only the failed icon when both failed_datetime and opened_datetime are set', async () => {
            givenMessageData({
                sent_datetime: '2024-03-21T11:00:00Z',
                opened_datetime: '2024-03-21T11:00:00Z',
                failed_datetime: '2024-03-21T11:05:00Z',
            })

            render(<RespondedByDMBubble {...defaultProps} />)

            await screen.findByText('Agent Smith')
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })
    })
})
