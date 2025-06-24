import { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { IconButton } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { TicketDetail } from 'tickets/ticket-detail'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

import { TicketModal } from '../TicketModal'
import { TicketModalProvider } from '../TicketModalProvider'

jest.mock('tickets/ticket-detail/components/TicketDetail', () => ({
    TicketDetail: jest.fn(
        ({
            additionalHeaderActions,
        }: {
            additionalHeaderActions: ReactNode
        }) => (
            <>
                <div>TicketDetail</div>
                {additionalHeaderActions}
            </>
        ),
    ),
}))

jest.mock('../TicketModalProvider', () => ({
    TicketModalProvider: jest.fn(({ children }) => children),
}))

jest.mock('@gorgias/merchant-ui-kit', () => ({
    ...jest.requireActual('@gorgias/merchant-ui-kit'),
    IconButton: jest.fn(() => <div>IconButton</div>),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const TicketDetailMock = assumeMock(TicketDetail)
const TicketModalProviderMock = assumeMock(TicketModalProvider)
const useFlagMock = assumeMock(useFlag)

describe('TicketModal', () => {
    const defaultProps = {
        ticketId: 1,
        onClose: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
    }

    beforeEach(() => {
        useFlagMock.mockReturnValue(false) // Default to modal view
    })

    it('should render nothing if no ticketId is passed', () => {
        const { container } = render(
            <TicketModal {...defaultProps} ticketId={null} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should call the TicketDetail component with the right props', () => {
        render(<TicketModal {...defaultProps} />)
        expect(screen.getByText('TicketDetail')).toBeInTheDocument()

        expect(TicketDetailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                ticketId: 1,
                summary: undefined,
            }),
            {},
        )

        expect(IconButton).toHaveBeenCalledWith(
            expect.objectContaining({
                onClick: defaultProps.onClose,
            }),
            {},
        )
    })

    it('should render a link to the full ticket', () => {
        render(<TicketModal {...defaultProps} />)
        const el = screen.getByText('View Ticket')
        expect(el).toBeInTheDocument()
        expect(el.closest('a')).toHaveAttribute('href', '/app/ticket/1')
    })

    it('should disable the navigation if no onNext / onPrevious handlers are passed', () => {
        render(
            <TicketModal
                {...defaultProps}
                onNext={undefined}
                onPrevious={undefined}
            />,
        )
        const previousEl = screen.getByText('Previous')
        const nextEl = screen.getByText('Next')

        expect(previousEl).toBeInTheDocument()
        expect(previousEl.closest('button')).toBeAriaDisabled()
        expect(nextEl).toBeInTheDocument()
        expect(nextEl.closest('button')).toBeAriaDisabled()
    })

    it('should call onNext when the next link is clicked', () => {
        render(<TicketModal {...defaultProps} />)

        const el = screen.getByText('Next')
        userEvent.click(el)

        expect(defaultProps.onNext).toHaveBeenCalled()
    })

    it('should call onPrevious when the previous link is clicked', () => {
        render(<TicketModal {...defaultProps} />)

        const el = screen.getByText('Previous')
        userEvent.click(el)

        expect(defaultProps.onPrevious).toHaveBeenCalled()
    })

    it('should wrap TicketDetail with TicketModalProvider', () => {
        render(<TicketModal {...defaultProps} />)

        expect(TicketModalProviderMock).toHaveBeenCalled()
    })

    it('should call useFlag with CustomerTimelineDrawerUX flag', () => {
        render(<TicketModal {...defaultProps} />)

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.CustomerTimelineDrawerUX,
        )
    })

    describe('when hasCTDrawerUX is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should render drawer instead of modal', () => {
            const { container } = render(<TicketModal {...defaultProps} />)

            expect(container.querySelector('.ticketDrawer')).toBeInTheDocument()
        })

        it('should render navigation buttons', () => {
            render(<TicketModal {...defaultProps} />)

            const previousEl = screen.getByText('Previous')
            const nextEl = screen.getByText('Next')

            expect(previousEl).toBeInTheDocument()
            expect(nextEl).toBeInTheDocument()
        })

        it('should render "View Ticket" link', () => {
            render(<TicketModal {...defaultProps} />)

            const viewTicketEl = screen.getByText('View Ticket')
            expect(viewTicketEl).toBeInTheDocument()
            expect(viewTicketEl.closest('a')).toHaveAttribute(
                'href',
                '/app/ticket/1',
            )
        })
    })

    describe('when hasCTDrawerUX is disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
        })

        it('should render modal instead of drawer', () => {
            render(<TicketModal {...defaultProps} />)

            expect(screen.getByText('TicketDetail')).toBeInTheDocument()

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('should render navigation buttons', () => {
            render(<TicketModal {...defaultProps} />)

            const previousEl = screen.getByText('Previous')
            const nextEl = screen.getByText('Next')

            expect(previousEl).toBeInTheDocument()
            expect(nextEl).toBeInTheDocument()
        })

        it('should render "View Ticket" link', () => {
            render(<TicketModal {...defaultProps} />)

            const viewTicketEl = screen.getByText('View Ticket')
            expect(viewTicketEl).toBeInTheDocument()
            expect(viewTicketEl.closest('a')).toHaveAttribute(
                'href',
                '/app/ticket/1',
            )
        })
    })
})
