import { useIsMobileResolution } from '@repo/hooks'
import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { history } from '@repo/routing'
import { assumeMock, render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useIsChatReady } from 'hooks/useIsChatReady'
import { Product, productConfig } from 'routes/layout/productConfig'

import { useCurrentRouteProduct } from '../../hooks/useCurrentRouteProduct'
import { usePreviousProductNavigation } from '../../hooks/usePreviousProductNavigation'
import { NavigationSidebar } from '../NavigationSidebar'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

jest.mock('routes/hooks/useCurrentRouteProduct')
const useCurrentRouteProductMock = assumeMock(useCurrentRouteProduct)

jest.mock('routes/hooks/usePreviousProductNavigation')
const usePreviousProductNavigationMock = assumeMock(
    usePreviousProductNavigation,
)

jest.mock('routes/layout/UserMenu', () => ({
    UserMenu: () => <div>UserMenu</div>,
}))

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useIsMobileResolution: jest.fn(),
}))
const mockUseIsMobileResolution = assumeMock(useIsMobileResolution)

jest.mock('routes/layout/NavigationSidebarNotificationsButton', () => ({
    NavigationSidebarNotificationsButton: () => <div>NotificationsButton</div>,
}))
jest.mock('routes/layout/NavigationSidebarSpotlightButton', () => ({
    NavigationSidebarSpotlightButton: () => (
        <button>NavigationSidebarSpotlightButton</button>
    ),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(() => ({ hasAccess: true })),
}))

jest.mock('hooks/useIsChatReady', () => ({
    useIsChatReady: jest.fn().mockReturnValue(true),
}))
const mockUseIsChatReady = assumeMock(useIsChatReady)

jest.mock('routes/layout/sidebars', () => ({
    InboxSidebar: () => <div>InboxSidebar</div>,
    AiAgentSidebar: () => <div>AiAgentSidebar</div>,
    MarketingSidebar: () => <div>MarketingSidebar</div>,
    AnalyticsSidebar: () => <div>AnalyticsSidebar</div>,
    WorkflowsSidebar: () => <div>WorkflowsSidebar</div>,
    CustomersSidebar: () => <div>CustomersSidebar</div>,
    SettingsSidebar: () => <div>SettingsSidebar</div>,
}))

jest.mock('utils', () => ({
    ...jest.requireActual('utils'),
    toggleChat: jest.fn(),
}))

const mockToggleChat = jest.requireMock('utils').toggleChat as jest.Mock
const mockToggleCollapse = jest.fn()

describe('NavigationSidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        usePreviousProductNavigationMock.mockReturnValue('/app/tickets')
        mockUseIsMobileResolution.mockReturnValue(false)
    })

    describe('non-sticky products', () => {
        beforeEach(() => {
            useCurrentRouteProductMock.mockReturnValue(
                productConfig[Product.Inbox],
            )
        })

        it('should render SidebarProductHeader for non-sticky products', () => {
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            expect(screen.getByText('Inbox')).toHaveTextContent('Inbox')
        })

        it('should render action buttons in header', () => {
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThanOrEqual(2)
        })

        it('should render InboxSidebar content', () => {
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            expect(screen.getByText('InboxSidebar')).toBeInTheDocument()
        })

        it('should render footer with UserMenu and buttons - expanded state', () => {
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            expect(screen.getByText('UserMenu')).toBeInTheDocument()
            expect(screen.getByText('NotificationsButton')).toBeInTheDocument()
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThanOrEqual(1)
        })

        it('should render footer with UserMenu and buttons - collapsed state', () => {
            render(
                <MockSidebarProvider
                    isCollapsed={true}
                    toggleCollapse={mockToggleCollapse}
                >
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            expect(screen.getByText('UserMenu')).toBeInTheDocument()
            expect(screen.getByText('NotificationsButton')).toBeInTheDocument()
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThanOrEqual(1)
        })

        it('should render collapse toggle button', () => {
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            const collapseButton = screen.getByRole('button', {
                name: /collapse sidebar/i,
            })
            expect(collapseButton).toBeInTheDocument()
        })

        it('should not render collapse toggle button on mobile resolution', () => {
            mockUseIsMobileResolution.mockReturnValue(true)
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            expect(
                screen.queryByRole('button', { name: /collapse sidebar/i }),
            ).not.toBeInTheDocument()
        })

        it('should call toggleCollapse when collapse button is clicked', async () => {
            const user = userEvent.setup()
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )

            const collapseButton = screen.getByRole('button', {
                name: /collapse sidebar/i,
            })
            await act(() => user.click(collapseButton))

            expect(mockToggleCollapse).toHaveBeenCalledTimes(1)
        })

        it('should call toggleChat when help button is clicked', async () => {
            const user = userEvent.setup()
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )

            const toggleChatButton = screen.getByRole('button', {
                name: /open chat/i,
            })
            await act(() => user.click(toggleChatButton))

            expect(mockToggleChat).toHaveBeenCalledTimes(1)
        })

        it('should render the chat button when chat is ready', () => {
            mockUseIsChatReady.mockReturnValue(true)
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )

            expect(
                screen.getByRole('button', { name: /open chat/i }),
            ).toBeInTheDocument()
        })

        it('should not render the chat button when chat is not ready', () => {
            mockUseIsChatReady.mockReturnValue(false)
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )

            expect(
                screen.queryByRole('button', { name: /open chat/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('sticky products (Settings)', () => {
        beforeEach(() => {
            useCurrentRouteProductMock.mockReturnValue(
                productConfig[Product.Settings],
            )
        })

        it('should render product name button for sticky products', () => {
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            expect(screen.getByText('Settings')).toBeInTheDocument()
        })

        it('should render SettingsSidebar content', () => {
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            expect(screen.getByText('SettingsSidebar')).toBeInTheDocument()
        })

        it('should render back button when sidebar is expanded', () => {
            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            expect(
                screen.getByRole('button', { name: /go back/i }),
            ).toBeInTheDocument()
        })

        it('should not render back button when sidebar is collapsed', () => {
            render(
                <MockSidebarProvider
                    isCollapsed={true}
                    toggleCollapse={mockToggleCollapse}
                >
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )
            expect(
                screen.queryByRole('button', { name: /go back/i }),
            ).not.toBeInTheDocument()
        })

        it('should navigate to previous non-sticky path when back button is clicked', async () => {
            const user = userEvent.setup()
            usePreviousProductNavigationMock.mockReturnValue('/app/tickets')

            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )

            await user.click(screen.getByRole('button', { name: /go back/i }))

            expect(history.push).toHaveBeenCalledWith('/app/tickets')
        })

        it('should navigate to Inbox default path when no previous non-sticky path exists', async () => {
            const user = userEvent.setup()
            usePreviousProductNavigationMock.mockReturnValue(null)

            render(
                <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                    <NavigationSidebar />
                </MockSidebarProvider>,
            )

            await user.click(screen.getByRole('button', { name: /go back/i }))

            expect(history.push).toHaveBeenCalledWith(
                productConfig[Product.Inbox].defaultPath,
            )
        })
    })

    describe('different product sidebars', () => {
        it.each([
            {
                product: Product.AiAgent,
                expectedSidebar: 'AiAgentSidebar',
                productName: 'AI Agent',
            },
            {
                product: Product.Marketing,
                expectedSidebar: 'MarketingSidebar',
                productName: 'Marketing',
            },
            {
                product: Product.Analytics,
                expectedSidebar: 'AnalyticsSidebar',
                productName: 'Analytics',
            },
            {
                product: Product.Workflows,
                expectedSidebar: 'WorkflowsSidebar',
                productName: 'Workflows',
            },
            {
                product: Product.Customers,
                expectedSidebar: 'CustomersSidebar',
                productName: 'Customers',
            },
        ])(
            'should render $expectedSidebar for $productName product',
            ({ product, expectedSidebar }) => {
                useCurrentRouteProductMock.mockReturnValue(
                    productConfig[product],
                )
                render(
                    <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                        <NavigationSidebar />
                    </MockSidebarProvider>,
                )
                expect(screen.getByText(expectedSidebar)).toBeInTheDocument()
            },
        )
    })

    it('should not render sidebar content for Home product', () => {
        useCurrentRouteProductMock.mockReturnValue(productConfig[Product.Home])
        const { container } = render(
            <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                <NavigationSidebar />
            </MockSidebarProvider>,
        )
        expect(
            container.querySelector('[data-name="sidebar-content"]'),
        ).toBeEmptyDOMElement()
    })
})
