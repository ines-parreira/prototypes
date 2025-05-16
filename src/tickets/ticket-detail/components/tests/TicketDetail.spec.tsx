import { render, screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import type { Ticket, TicketCompact } from '@gorgias/api-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { assumeMock } from 'utils/testing'

import { useTicket } from '../../hooks/useTicket'
import { TicketDetail } from '../TicketDetail'
import { TicketHeader } from '../TicketHeader'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    LoadingSpinner: () => <div>LoadingSpinner</div>,
}))

jest.mock('../../hooks/useTicket', () => ({ useTicket: jest.fn() }))
const useTicketMock = assumeMock(useTicket)

jest.mock('../TicketHeader', () => ({
    TicketHeader: jest.fn(() => <div>TicketHeader</div>),
}))

jest.mock('pages/tickets/detail/components/TicketSummary', () => ({
    __esModule: true,
    default: () => <div>TicketSummarySection</div>,
}))

const useFlagsMock = useFlags as jest.Mock
describe('TicketDetail', () => {
    beforeEach(() => {
        useTicketMock.mockReturnValue({
            body: [],
            isLoading: true,
            ticket: undefined,
        })
    })

    it('should render a spinner while the page is loading', () => {
        render(<TicketDetail ticketId={1} />)
        expect(screen.queryByText('TicketHeader')).not.toBeInTheDocument()
        expect(screen.getByText('LoadingSpinner')).toBeInTheDocument()
    })

    it('should render the header if a summary is given even if the ticket is loading and pass it the right props', () => {
        const summary = { id: 1 } as TicketCompact
        const AdditionalHeaderAction = () => <button>Action</button>
        render(
            <TicketDetail
                summary={summary}
                ticketId={1}
                AdditionalHeaderAction={AdditionalHeaderAction}
            />,
        )
        expect(screen.getByText('TicketHeader')).toBeInTheDocument()
        expect(screen.getByText('LoadingSpinner')).toBeInTheDocument()

        expect(TicketHeader).toHaveBeenCalledWith(
            {
                ticket: summary,
                AdditionalAction: AdditionalHeaderAction,
            },
            {},
        )
    })

    it('should dump the ticket to the page once loaded', () => {
        useTicketMock.mockReturnValue({
            body: [],
            isLoading: false,
            ticket: { id: 1 } as Ticket,
        })
        render(<TicketDetail ticketId={1} />)
        expect(screen.getByTestId('dump')).toBeInTheDocument()
    })

    it('should render AI ticket summary when ticket is loaded and enableAITicketSummary enabled', () => {
        useTicketMock.mockReturnValue({
            body: [],
            isLoading: false,
            ticket: { id: 1 } as Ticket,
        })
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AITicketSummary]: true,
        })

        render(<TicketDetail ticketId={1} />)
        expect(screen.getByText('TicketSummarySection')).toBeInTheDocument()
    })

    it('should not render AI ticket summary when ticket is loaded and enableAITicketSummary disabled', () => {
        useTicketMock.mockReturnValue({
            body: [],
            isLoading: true,
            ticket: { id: 1 } as Ticket,
        })
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AITicketSummary]: true,
        })

        render(<TicketDetail ticketId={1} />)
        expect(
            screen.queryByText('TicketSummarySection'),
        ).not.toBeInTheDocument()
    })
})
