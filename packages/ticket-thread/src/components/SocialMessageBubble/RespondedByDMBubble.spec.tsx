import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import type * as HelpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useGetTicketMessage } from '@gorgias/helpdesk-queries'

import { useTicketThreadDateTimeFormat } from '../../hooks/shared/useTicketThreadDateTimeFormat'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { RespondedByDMBubble } from './RespondedByDMBubble'

vi.mock('@gorgias/helpdesk-queries', async (importOriginal) => {
    const actual = await importOriginal<typeof HelpdeskQueriesModule>()
    return { ...actual, useGetTicketMessage: vi.fn() }
})

vi.mock('../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

const mockUseGetTicketMessage = vi.mocked(useGetTicketMessage)
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

function makeMessageData(
    overrides: Partial<{
        sent_datetime: string | null
        opened_datetime: string | null
        failed_datetime: string | null
        created_datetime: string | null
    }> = {},
) {
    return {
        data: {
            data: {
                sender,
                body_text: null,
                channel: 'instagram-direct-message',
                created_datetime: '2024-03-21T11:00:00Z',
                sent_datetime: null,
                opened_datetime: null,
                failed_datetime: null,
                ...overrides,
            },
        },
    } as ReturnType<typeof useGetTicketMessage>
}

beforeEach(() => {
    vi.clearAllMocks()
    server.use(
        getCurrentUserHandler().handler,
        http.get('/api/users/:id', () => HttpResponse.json({})),
    )
    mockUseGetTicketMessage.mockReturnValue({ data: undefined } as ReturnType<
        typeof useGetTicketMessage
    >)
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
        it('shows the sender name', () => {
            mockUseGetTicketMessage.mockReturnValue(makeMessageData())

            render(<RespondedByDMBubble {...defaultProps} />)

            expect(screen.getByText('Agent Smith')).toBeInTheDocument()
        })

        it('shows the timestamp when created_datetime is set', () => {
            mockUseGetTicketMessage.mockReturnValue(makeMessageData())

            render(<RespondedByDMBubble {...defaultProps} />)

            expect(screen.getByText('2024-03-21')).toBeInTheDocument()
        })

        it('shows no delivery icon when no delivery timestamp is set', () => {
            mockUseGetTicketMessage.mockReturnValue(makeMessageData())

            render(<RespondedByDMBubble {...defaultProps} />)

            // 3 icons: avatar + channel + RepliedViaLabel arrow icon
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(3)
        })

        it('shows a sent icon when only sent_datetime is set', () => {
            mockUseGetTicketMessage.mockReturnValue(
                makeMessageData({ sent_datetime: '2024-03-21T11:00:00Z' }),
            )

            render(<RespondedByDMBubble {...defaultProps} />)

            // 4 icons: avatar + channel + delivery + RepliedViaLabel arrow icon
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })

        it('shows a read icon when opened_datetime is set', () => {
            mockUseGetTicketMessage.mockReturnValue(
                makeMessageData({
                    sent_datetime: '2024-03-21T11:00:00Z',
                    opened_datetime: '2024-03-21T12:00:00Z',
                }),
            )

            render(<RespondedByDMBubble {...defaultProps} />)

            // 4 icons: avatar + channel + delivery + RepliedViaLabel arrow icon
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })

        it('shows a failed icon when failed_datetime is set', () => {
            mockUseGetTicketMessage.mockReturnValue(
                makeMessageData({ failed_datetime: '2024-03-21T11:00:00Z' }),
            )

            render(<RespondedByDMBubble {...defaultProps} />)

            // 4 icons: avatar + channel + delivery + RepliedViaLabel arrow icon
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })

        it('shows only the failed icon when both failed_datetime and sent_datetime are set', () => {
            mockUseGetTicketMessage.mockReturnValue(
                makeMessageData({
                    sent_datetime: '2024-03-21T11:00:00Z',
                    failed_datetime: '2024-03-21T11:05:00Z',
                }),
            )

            render(<RespondedByDMBubble {...defaultProps} />)

            // still 4, not 5 — failed takes priority over sent
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })

        it('shows only the failed icon when both failed_datetime and opened_datetime are set', () => {
            mockUseGetTicketMessage.mockReturnValue(
                makeMessageData({
                    sent_datetime: '2024-03-21T11:00:00Z',
                    opened_datetime: '2024-03-21T11:00:00Z',
                    failed_datetime: '2024-03-21T11:05:00Z',
                }),
            )

            render(<RespondedByDMBubble {...defaultProps} />)

            // still 4, not 5 — failed takes priority over opened
            expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(4)
        })
    })
})
