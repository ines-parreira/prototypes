import type React from 'react'

import { render } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import TicketWrapper from '../TicketWrapper'
import useSplitTicketCloseNavigation from '../useSplitTicketCloseNavigation'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('../useSplitTicketCloseNavigation', () => jest.fn())

jest.mock('pages/tickets/detail/TicketDetailContainer', () =>
    jest.fn(({ onGoToNextTicket, onToggleUnread }) => (
        <div data-testid="ticket-detail-container">
            {onGoToNextTicket && (
                <>
                    <button onClick={onGoToNextTicket}>
                        Go to next ticket
                    </button>
                    <button onClick={onGoToNextTicket}>Send & Close</button>
                </>
            )}
            {onToggleUnread && (
                <button onClick={() => onToggleUnread('123', true)}>
                    Toggle unread
                </button>
            )}
        </div>
    )),
)

jest.mock('providers/OutboundTranslationProvider', () => ({
    OutboundTranslationProvider: ({
        children,
    }: {
        children: React.ReactNode
    }) => <div data-testid="outbound-translation-provider">{children}</div>,
}))

const useSplitTicketCloseNavigationMock =
    useSplitTicketCloseNavigation as jest.Mock
const useParamsMock = useParams as jest.Mock

describe('TicketWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useParamsMock.mockReturnValue({ ticketId: '123' })
        useSplitTicketCloseNavigationMock.mockReturnValue(undefined)
    })

    it('renders TicketDetailContainer wrapped in OutboundTranslationProvider', () => {
        const { getByTestId } = render(<TicketWrapper />)

        expect(getByTestId('outbound-translation-provider')).toBeInTheDocument()
        expect(getByTestId('ticket-detail-container')).toBeInTheDocument()
    })

    it('passes onToggleUnread to TicketDetailContainer when provided', () => {
        const onToggleUnreadMock = jest.fn()
        const { getByText } = render(
            <TicketWrapper onToggleUnread={onToggleUnreadMock} />,
        )

        const toggleUnreadButton = getByText('Toggle unread')
        toggleUnreadButton.click()

        expect(onToggleUnreadMock).toHaveBeenCalledWith('123', true)
    })

    it('does not pass onGoToNextTicket when the hook returns undefined', () => {
        const { queryByText } = render(
            <TicketWrapper isOnSplitTicketView={false} />,
        )

        expect(useSplitTicketCloseNavigationMock).toHaveBeenCalledWith({
            isOnSplitTicketView: false,
        })
        expect(queryByText('Go to next ticket')).not.toBeInTheDocument()
    })

    it('passes the hook callback to TicketDetailContainer', () => {
        const onGoToNextTicket = jest.fn()
        useSplitTicketCloseNavigationMock.mockReturnValue(onGoToNextTicket)

        const { getByText } = render(
            <TicketWrapper isOnSplitTicketView={true} />,
        )

        expect(useSplitTicketCloseNavigationMock).toHaveBeenCalledWith({
            isOnSplitTicketView: true,
        })
        expect(getByText('Go to next ticket')).toBeInTheDocument()
    })

    it('wires the hook callback to the Send & Close flow', () => {
        const onGoToNextTicket = jest.fn()
        useSplitTicketCloseNavigationMock.mockReturnValue(onGoToNextTicket)

        const { getByText } = render(
            <TicketWrapper isOnSplitTicketView={true} />,
        )

        const sendAndCloseButton = getByText('Send & Close')
        sendAndCloseButton.click()

        expect(onGoToNextTicket).toHaveBeenCalledTimes(1)
    })
})
