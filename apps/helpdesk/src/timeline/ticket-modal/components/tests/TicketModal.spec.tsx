import type { ReactNode } from 'react'
import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { useHistory } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { TicketDetail } from 'tickets/ticket-detail'

import { TicketModal } from '../TicketModal'
import { TicketModalProvider } from '../TicketModalProvider'

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

const mockIconButtonRender = jest.fn()

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    LegacyIconButton: React.forwardRef<HTMLButtonElement, any>((props, ref) => {
        mockIconButtonRender(props, ref)
        return (
            <button ref={ref} {...props}>
                Mock IconButton
            </button>
        )
    }),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('tickets/ticket-detail/components/TicketDetail', () => ({
    TicketDetail: jest.fn(
        ({
            additionalHeaderActions,
        }: {
            additionalHeaderActions: ReactNode
        }) => (
            <div>
                <div>TicketDetail</div>
                {additionalHeaderActions}
            </div>
        ),
    ),
}))

jest.mock('../TicketModalProvider', () => ({
    TicketModalProvider: jest.fn(({ children }) => children),
}))

const TicketDetailMock = assumeMock(TicketDetail)
const TicketModalProviderMock = assumeMock(TicketModalProvider)
const useFlagMock = assumeMock(useFlag)
const useHistoryMock = assumeMock(useHistory)

describe('TicketModal', () => {
    const defaultProps = {
        ticketId: 1,
        onClose: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
    }

    const mockHistoryPush = jest.fn()

    beforeEach(() => {
        useFlagMock.mockReturnValue(false) // Default to modal view
        useHistoryMock.mockReturnValue({ push: mockHistoryPush } as any)
        mockIconButtonRender.mockClear()
        mockHistoryPush.mockClear()
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

        expect(mockIconButtonRender).toHaveBeenCalledWith(
            expect.objectContaining({
                onClick: defaultProps.onClose,
            }),
            expect.anything(),
        )
    })

    it('should render a tracked link to the full ticket', () => {
        render(<TicketModal {...defaultProps} />)
        const el = screen.getByText('Expand Ticket')
        expect(el).toBeInTheDocument()
        expect(el.closest('a')).toHaveAttribute('href', '/app/ticket/1')

        fireEvent.click(el)

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerTimelineModalViewTicketClicked,
        )
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
        fireEvent.click(el)

        expect(defaultProps.onNext).toHaveBeenCalled()
    })

    it('should call onPrevious when the previous link is clicked', () => {
        render(<TicketModal {...defaultProps} />)

        const el = screen.getByText('Previous')
        fireEvent.click(el)

        expect(defaultProps.onPrevious).toHaveBeenCalled()
    })

    it('should wrap TicketDetail with TicketModalProvider', () => {
        render(<TicketModal {...defaultProps} />)

        expect(TicketModalProviderMock).toHaveBeenCalled()
    })

    it('should focus the close button on mount', () => {
        const mockFocus = jest
            .spyOn(HTMLElement.prototype, 'focus')
            .mockImplementation(() => {})

        render(<TicketModal {...defaultProps} />)

        expect(mockFocus).toHaveBeenCalled()

        mockFocus.mockRestore()
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

        it('should render "Expand Ticket" link and log event', () => {
            render(<TicketModal {...defaultProps} />)

            const expandTicketEl = screen.getByText('Expand Ticket')
            expect(expandTicketEl).toBeInTheDocument()
            expect(expandTicketEl.closest('a')).toHaveAttribute(
                'href',
                '/app/ticket/1',
            )

            fireEvent.click(expandTicketEl)

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.CustomerTimelineModalViewTicketClicked,
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

        it('should render "Expand ticket" link', () => {
            render(<TicketModal {...defaultProps} />)

            const expandTicketEl = screen.getByText('Expand Ticket')
            expect(expandTicketEl).toBeInTheDocument()
            expect(expandTicketEl.closest('a')).toHaveAttribute(
                'href',
                '/app/ticket/1',
            )
        })
    })
})
