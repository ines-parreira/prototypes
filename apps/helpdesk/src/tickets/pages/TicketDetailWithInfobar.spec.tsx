import { render, screen } from '@testing-library/react'

import { Handle } from 'core/layout/panels'
import { KnowledgeSourceSideBarMode } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { KnowledgeSourceSideBarProvider } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider'
import KnowledgeSourceSidebarWrapper from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSidebarWrapper'
import { TicketDetailPanel } from 'tickets/ticket-detail'
import { TicketInfobarPanel } from 'tickets/ticket-infobar'

import { TicketDetailWithInfobar } from './TicketDetailWithInfobar'

const mockOnToggleUnread = jest.fn()

jest.mock('core/layout/panels', () => ({
    Handle: jest.fn(() => <div role="separator">Panel Handle</div>),
}))

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
    () => ({
        useKnowledgeSourceSideBar: jest.fn(),
    }),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider',
    () => ({
        KnowledgeSourceSideBarProvider: jest.fn(({ children }) => (
            <div role="region" aria-label="Knowledge Source Provider">
                {children}
            </div>
        )),
    }),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSidebarWrapper',
    () => ({
        __esModule: true,
        default: jest.fn(() => (
            <div role="complementary" aria-label="Knowledge Source Sidebar">
                Knowledge Source Wrapper
            </div>
        )),
    }),
)

jest.mock('tickets/ticket-detail', () => ({
    TicketDetailPanel: jest.fn(() => (
        <main role="main" aria-label="Ticket Detail">
            Ticket Detail Panel
        </main>
    )),
}))

jest.mock('tickets/ticket-infobar', () => ({
    TicketInfobarPanel: jest.fn(() => (
        <aside role="complementary" aria-label="Ticket Information">
            Ticket Infobar Panel
        </aside>
    )),
}))

const mockedHandle = jest.mocked(Handle)
const mockedUseKnowledgeSourceSideBar = jest.mocked(useKnowledgeSourceSideBar)
const mockedKnowledgeSourceSideBarProvider = jest.mocked(
    KnowledgeSourceSideBarProvider,
)
const mockedKnowledgeSourceSidebarWrapper = jest.mocked(
    KnowledgeSourceSidebarWrapper,
)
const mockedTicketDetailPanel = jest.mocked(TicketDetailPanel)
const mockedTicketInfobarPanel = jest.mocked(TicketInfobarPanel)

describe('TicketDetailWithInfobar', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when component renders', () => {
        beforeEach(() => {
            mockedUseKnowledgeSourceSideBar.mockReturnValue({
                mode: null,
                selectedResource: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })
        })

        it('wraps content in KnowledgeSourceSideBarProvider', () => {
            render(
                <TicketDetailWithInfobar onToggleUnread={mockOnToggleUnread} />,
            )

            expect(mockedKnowledgeSourceSideBarProvider).toHaveBeenCalledWith(
                expect.objectContaining({
                    children: expect.anything(),
                }),
                {},
            )
        })

        it('renders TicketDetailPanel with onToggleUnread prop', () => {
            render(
                <TicketDetailWithInfobar onToggleUnread={mockOnToggleUnread} />,
            )

            expect(mockedTicketDetailPanel).toHaveBeenCalledWith(
                expect.objectContaining({
                    onToggleUnread: mockOnToggleUnread,
                }),
                {},
            )
        })

        it('renders Handle component', () => {
            render(
                <TicketDetailWithInfobar onToggleUnread={mockOnToggleUnread} />,
            )

            expect(mockedHandle).toHaveBeenCalledWith({}, {})
        })

        it('renders TicketInfobarPanel', () => {
            render(
                <TicketDetailWithInfobar onToggleUnread={mockOnToggleUnread} />,
            )

            expect(mockedTicketInfobarPanel).toHaveBeenCalledWith({}, {})
        })

        it('renders all required components in DOM', () => {
            render(
                <TicketDetailWithInfobar onToggleUnread={mockOnToggleUnread} />,
            )

            expect(
                screen.getByRole('region', {
                    name: 'Knowledge Source Provider',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('main', { name: 'Ticket Detail' }),
            ).toBeInTheDocument()
            expect(screen.getByRole('separator')).toBeInTheDocument()
            expect(
                screen.getByRole('complementary', {
                    name: 'Ticket Information',
                }),
            ).toBeInTheDocument()
        })
    })

    describe('when mode is null', () => {
        beforeEach(() => {
            mockedUseKnowledgeSourceSideBar.mockReturnValue({
                mode: null,
                selectedResource: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            render(
                <TicketDetailWithInfobar onToggleUnread={mockOnToggleUnread} />,
            )
        })

        it('does not render KnowledgeSourceSidebarWrapper', () => {
            expect(mockedKnowledgeSourceSidebarWrapper).not.toHaveBeenCalled()
            expect(
                screen.queryByRole('complementary', {
                    name: 'Knowledge Source Sidebar',
                }),
            ).not.toBeInTheDocument()
        })
    })

    describe('when mode is PREVIEW', () => {
        beforeEach(() => {
            mockedUseKnowledgeSourceSideBar.mockReturnValue({
                mode: KnowledgeSourceSideBarMode.PREVIEW,
                selectedResource: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            render(
                <TicketDetailWithInfobar onToggleUnread={mockOnToggleUnread} />,
            )
        })

        it('renders KnowledgeSourceSidebarWrapper', () => {
            expect(
                screen.getByRole('complementary', {
                    name: 'Knowledge Source Sidebar',
                }),
            ).toBeInTheDocument()
        })
    })

    describe('when mode is EDIT', () => {
        beforeEach(() => {
            mockedUseKnowledgeSourceSideBar.mockReturnValue({
                mode: KnowledgeSourceSideBarMode.EDIT,
                selectedResource: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            render(
                <TicketDetailWithInfobar onToggleUnread={mockOnToggleUnread} />,
            )
        })

        it('renders KnowledgeSourceSidebarWrapper', () => {
            expect(
                screen.getByRole('complementary', {
                    name: 'Knowledge Source Sidebar',
                }),
            ).toBeInTheDocument()
        })
    })

    describe('when mode is CREATE', () => {
        beforeEach(() => {
            mockedUseKnowledgeSourceSideBar.mockReturnValue({
                mode: KnowledgeSourceSideBarMode.CREATE,
                selectedResource: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            render(
                <TicketDetailWithInfobar onToggleUnread={mockOnToggleUnread} />,
            )
        })

        it('renders KnowledgeSourceSidebarWrapper', () => {
            expect(
                screen.getByRole('complementary', {
                    name: 'Knowledge Source Sidebar',
                }),
            ).toBeInTheDocument()
        })
    })

    describe('when onToggleUnread is not provided', () => {
        beforeEach(() => {
            mockedUseKnowledgeSourceSideBar.mockReturnValue({
                mode: null,
                selectedResource: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            render(<TicketDetailWithInfobar />)
        })

        it('passes undefined onToggleUnread to TicketDetailPanel', () => {
            expect(mockedTicketDetailPanel).toHaveBeenCalledWith(
                expect.objectContaining({
                    onToggleUnread: undefined,
                }),
                {},
            )
        })
    })
})
