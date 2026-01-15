import { Handle, Panel } from '@repo/layout'
import { useTicketInfobarNavigation } from '@repo/navigation'
import { render, screen } from '@testing-library/react'

import { InfobarNavigationPanel } from 'tickets/navigation'

import { NewTicketPage } from '../NewTicketPage'

jest.mock('@repo/navigation', () => ({
    useTicketInfobarNavigation: jest.fn(),
}))
const useTicketInfobarNavigationMock = jest.mocked(useTicketInfobarNavigation)

jest.mock('@repo/layout', () => ({
    ...jest.requireActual('@repo/layout'),
    Handle: jest.fn(() => <div role="separator">Panel Handle</div>),
    Panel: jest.fn(({ children }) => <div>{children}</div>),
}))

jest.mock('pages/tickets/detail/TicketInfobarContainer', () => ({
    __esModule: true,
    default: jest.fn(() => (
        <div role="complementary" aria-label="Ticket Information">
            TicketInfobarContainer
        </div>
    )),
}))

jest.mock('tickets/navigation', () => ({
    InfobarNavigationPanel: jest.fn(() => (
        <div role="navigation" aria-label="Infobar Navigation">
            InfobarNavigationPanel
        </div>
    )),
}))

jest.mock('@repo/tickets', () => ({
    TicketHeaderContainer: jest.fn(({ children }) => (
        <header role="banner">{children}</header>
    )),
    TicketHeaderLeft: jest.fn(({ children }) => <div>{children}</div>),
    TicketHeaderRight: jest.fn(({ children }) => <div>{children}</div>),
    TicketLayout: jest.fn(({ children }) => <div>{children}</div>),
    TicketLayoutContent: jest.fn(({ children }) => <div>{children}</div>),
}))

const mockedPanel = jest.mocked(Panel)
const mockedHandle = jest.mocked(Handle)
const mockedInfobarNavigationPanel = jest.mocked(InfobarNavigationPanel)

describe('NewTicketPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when infobar is expanded', () => {
        beforeEach(() => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
            } as any)
        })

        it('renders the header with title', () => {
            render(<NewTicketPage />)

            expect(screen.getByText('New ticket')).toBeInTheDocument()
        })

        it('renders the main content panel', () => {
            render(<NewTicketPage />)

            expect(screen.getByText('Main content here')).toBeInTheDocument()
        })

        it('renders the infobar container with expanded panel config', () => {
            render(<NewTicketPage />)

            expect(
                screen.getByRole('complementary', {
                    name: 'Ticket Information',
                }),
            ).toBeInTheDocument()
        })

        it('renders the infobar navigation panel', () => {
            render(<NewTicketPage />)

            expect(
                screen.getByRole('navigation', { name: 'Infobar Navigation' }),
            ).toBeInTheDocument()
        })

        it('renders the panel handle', () => {
            render(<NewTicketPage />)

            expect(screen.getByRole('separator')).toBeInTheDocument()
        })

        it('renders Panel with expanded config', () => {
            render(<NewTicketPage />)

            const expandedPanelCalls = mockedPanel.mock.calls.filter(
                (call) => call[0].name === 'infobar-expanded',
            )

            expect(expandedPanelCalls).toHaveLength(1)
            expect(expandedPanelCalls[0][0].config).toEqual({
                defaultSize: 340,
                minSize: 340,
                maxSize: 0.33,
            })
        })
    })

    describe('when infobar is collapsed', () => {
        beforeEach(() => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: false,
            } as any)
        })

        it('renders the header with title', () => {
            render(<NewTicketPage />)

            expect(screen.getByText('New ticket')).toBeInTheDocument()
        })

        it('renders the main content panel', () => {
            render(<NewTicketPage />)

            expect(screen.getByText('Main content here')).toBeInTheDocument()
        })

        it('renders the infobar container', () => {
            render(<NewTicketPage />)

            expect(
                screen.getByRole('complementary', {
                    name: 'Ticket Information',
                }),
            ).toBeInTheDocument()
        })

        it('renders Panel with collapsed config', () => {
            render(<NewTicketPage />)

            const collapsedPanelCalls = mockedPanel.mock.calls.filter(
                (call) => call[0].name === 'infobar-collapsed',
            )

            expect(collapsedPanelCalls).toHaveLength(1)
            expect(collapsedPanelCalls[0][0].config).toEqual({
                defaultSize: 0,
                minSize: 0,
                maxSize: 0,
            })
        })
    })

    describe('panel configuration', () => {
        beforeEach(() => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
            } as any)
        })

        it('renders ticket detail panel with correct config', () => {
            render(<NewTicketPage />)

            const ticketDetailPanelCalls = mockedPanel.mock.calls.filter(
                (call) => call[0].name === 'ticket-detail',
            )

            expect(ticketDetailPanelCalls).toHaveLength(1)
            expect(ticketDetailPanelCalls[0][0].config).toEqual({
                defaultSize: Infinity,
                minSize: 300,
                maxSize: Infinity,
            })
        })

        it('renders Handle component between panels', () => {
            render(<NewTicketPage />)

            expect(mockedHandle).toHaveBeenCalledWith({}, {})
        })

        it('renders InfobarNavigationPanel', () => {
            render(<NewTicketPage />)

            expect(mockedInfobarNavigationPanel).toHaveBeenCalled()
        })
    })
})
