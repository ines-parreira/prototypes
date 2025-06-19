import { render, screen } from '@testing-library/react'

import { TicketMessage } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { assumeMock } from 'utils/testing'

import { MessageMetadata } from '../MessageMetadata'
import { MessageStatusIndicator } from '../MessageStatusIndicator'

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('pages/common/utils/DatetimeLabel', () =>
    jest.fn(() => <div>DatetimeLabel</div>),
)

jest.mock('../MessageStatusIndicator', () => ({
    MessageStatusIndicator: jest.fn(() => <div>MessageStatusIndicator</div>),
}))

describe('MessageMetadata', () => {
    const baseMessage = {
        created_datetime: '2024-01-13T14:08:53Z',
        meta: {},
    } as TicketMessage

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should render null if the ticket thread revamp is enabled', () => {
        useFlagMock.mockReturnValue(true)
        const { container } = render(<MessageMetadata message={baseMessage} />)
        expect(container.firstChild).toBe(null)
    })

    it('should call message status indicator with the correct props', () => {
        render(<MessageMetadata message={baseMessage} />)

        expect(MessageStatusIndicator).toHaveBeenCalledWith(
            {
                message: baseMessage,
            },
            expect.anything(),
        )
    })

    it('renders call DatetimeLabel with the correct props', () => {
        render(<MessageMetadata message={baseMessage} />)

        expect(DatetimeLabel).toHaveBeenCalledWith(
            {
                dateTime: baseMessage.created_datetime,
            },
            expect.anything(),
        )
    })

    it('renders link to original ticket for duplicated message', () => {
        const duplicatedMessage = {
            ...baseMessage,
            meta: {
                is_duplicated: true,
                private_reply: {
                    original_ticket_id: '123',
                },
            },
        } as TicketMessage

        render(<MessageMetadata message={duplicatedMessage} />)

        const link = screen.getByRole('link', { name: /ticket/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '123')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('does not render link for non-duplicated message', () => {
        render(<MessageMetadata message={baseMessage} />)
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
})
