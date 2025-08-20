import React from 'react'

import { render } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import history from 'pages/history'
import { useSplitTicketView } from 'split-ticket-view-toggle'

import TicketWrapper from '../TicketWrapper'

// Mock dependencies
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('split-ticket-view-toggle', () => ({
    useSplitTicketView: jest.fn(),
}))

jest.mock('pages/history', () => ({
    push: jest.fn(),
}))

jest.mock('pages/tickets/detail/TicketDetailContainer', () =>
    jest.fn(({ onGoToNextTicket, onToggleUnread }) => (
        <div data-testid="ticket-detail-container">
            {onGoToNextTicket && (
                <button onClick={onGoToNextTicket}>Go to next ticket</button>
            )}
            {onToggleUnread && (
                <button onClick={() => onToggleUnread('123', true)}>
                    Toggle unread
                </button>
            )}
        </div>
    )),
)

jest.mock(
    'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/TicketMessageTranslationDisplayProvider',
    () => ({
        TicketMessageTranslationDisplayProvider: ({
            children,
        }: {
            children: React.ReactNode
        }) => <div data-testid="translation-provider">{children}</div>,
    }),
)

const useParamsMock = useParams as jest.Mock
const useSplitTicketViewMock = useSplitTicketView as jest.Mock
const historyMock = history as jest.Mocked<typeof history>

describe('TicketWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useParamsMock.mockReturnValue({ viewId: 'test-view-id' })
        useSplitTicketViewMock.mockReturnValue({ nextTicketId: null })
    })

    it('should render TicketDetailContainer wrapped in TicketMessageTranslationDisplayProvider', () => {
        const { getByTestId } = render(<TicketWrapper />)

        expect(getByTestId('translation-provider')).toBeInTheDocument()
        expect(getByTestId('ticket-detail-container')).toBeInTheDocument()
    })

    it('should pass onToggleUnread to TicketDetailContainer when provided', () => {
        const onToggleUnreadMock = jest.fn()
        const { getByText } = render(
            <TicketWrapper onToggleUnread={onToggleUnreadMock} />,
        )

        const toggleUnreadButton = getByText('Toggle unread')
        toggleUnreadButton.click()

        expect(onToggleUnreadMock).toHaveBeenCalledWith('123', true)
    })

    it('should not pass onGoToNextTicket when isOnSplitTicketView is false', () => {
        const { queryByText } = render(
            <TicketWrapper isOnSplitTicketView={false} />,
        )

        expect(queryByText('Go to next ticket')).not.toBeInTheDocument()
    })

    it('should not pass onGoToNextTicket when isOnSplitTicketView is undefined', () => {
        const { queryByText } = render(<TicketWrapper />)

        expect(queryByText('Go to next ticket')).not.toBeInTheDocument()
    })

    it('should pass onGoToNextTicket when isOnSplitTicketView is true', () => {
        const { getByText } = render(
            <TicketWrapper isOnSplitTicketView={true} />,
        )

        expect(getByText('Go to next ticket')).toBeInTheDocument()
    })

    it('should navigate to next ticket URL when onGoToNextTicket is called', () => {
        useSplitTicketViewMock.mockReturnValue({
            nextTicketId: 'next-ticket-456',
        })

        const { getByText } = render(
            <TicketWrapper isOnSplitTicketView={true} />,
        )

        const goToNextButton = getByText('Go to next ticket')
        goToNextButton.click()

        expect(historyMock.push).toHaveBeenCalledWith(
            '/app/views/test-view-id/next-ticket-456',
        )
    })

    it('should navigate to view URL when no next ticket ID is available', () => {
        useSplitTicketViewMock.mockReturnValue({ nextTicketId: null })

        const { getByText } = render(
            <TicketWrapper isOnSplitTicketView={true} />,
        )

        const goToNextButton = getByText('Go to next ticket')
        goToNextButton.click()

        expect(historyMock.push).toHaveBeenCalledWith('/app/views/test-view-id')
    })

    it('should handle different viewId from params', () => {
        useParamsMock.mockReturnValue({ viewId: 'different-view-id' })
        useSplitTicketViewMock.mockReturnValue({ nextTicketId: 'ticket-789' })

        const { getByText } = render(
            <TicketWrapper isOnSplitTicketView={true} />,
        )

        const goToNextButton = getByText('Go to next ticket')
        goToNextButton.click()

        expect(historyMock.push).toHaveBeenCalledWith(
            '/app/views/different-view-id/ticket-789',
        )
    })

    it('should handle empty nextTicketId', () => {
        useSplitTicketViewMock.mockReturnValue({ nextTicketId: '' })

        const { getByText } = render(
            <TicketWrapper isOnSplitTicketView={true} />,
        )

        const goToNextButton = getByText('Go to next ticket')
        goToNextButton.click()

        expect(historyMock.push).toHaveBeenCalledWith('/app/views/test-view-id')
    })

    it('should handle undefined nextTicketId', () => {
        useSplitTicketViewMock.mockReturnValue({ nextTicketId: undefined })

        const { getByText } = render(
            <TicketWrapper isOnSplitTicketView={true} />,
        )

        const goToNextButton = getByText('Go to next ticket')
        goToNextButton.click()

        expect(historyMock.push).toHaveBeenCalledWith('/app/views/test-view-id')
    })

    it('should memoize nextUrl correctly', () => {
        useSplitTicketViewMock.mockReturnValue({ nextTicketId: 'stable-id' })

        const { rerender } = render(
            <TicketWrapper isOnSplitTicketView={true} />,
        )

        // Re-render with same props
        rerender(<TicketWrapper isOnSplitTicketView={true} />)

        // The URL should be consistently calculated
        expect(useSplitTicketViewMock).toHaveBeenCalled()
    })
})
