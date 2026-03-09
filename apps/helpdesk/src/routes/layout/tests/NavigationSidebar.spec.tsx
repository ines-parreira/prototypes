import { SidebarContext } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Product, productConfig } from 'routes/layout/productConfig'

import { useCurrentRouteProduct } from '../../hooks/useCurrentRouteProduct'
import { NavigationSidebar } from '../NavigationSidebar'

jest.mock('routes/hooks/useCurrentRouteProduct')
const useCurrentRouteProductMock = assumeMock(useCurrentRouteProduct)

jest.mock('common/navigation/components/UserItem', () => ({
    __esModule: true,
    default: () => <div>UserItem</div>,
}))

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

const wrapper = ({ children }: any) => (
    <SidebarContext.Provider
        value={{ isCollapsed: false, toggleCollapse: mockToggleCollapse }}
    >
        {children}
    </SidebarContext.Provider>
)

describe('NavigationSidebar', () => {
    describe('non-sticky products', () => {
        beforeEach(() => {
            useCurrentRouteProductMock.mockReturnValue(
                productConfig[Product.Inbox],
            )
        })

        it('should render SidebarProductHeader for non-sticky products', () => {
            render(<NavigationSidebar />, { wrapper })
            expect(screen.getByText('Inbox')).toHaveTextContent('Inbox')
        })

        it('should render action buttons in header', () => {
            render(<NavigationSidebar />, { wrapper })
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThanOrEqual(2)
        })

        it('should render InboxSidebar content', () => {
            render(<NavigationSidebar />, { wrapper })
            expect(screen.getByText('InboxSidebar')).toBeInTheDocument()
        })

        it('should render footer with UserItem and buttons - expanded state', () => {
            render(<NavigationSidebar />, { wrapper })
            expect(screen.getByText('UserItem')).toBeInTheDocument()
            expect(screen.getByText('NotificationsButton')).toBeInTheDocument()
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThanOrEqual(1)
        })

        it('should render footer with UserItem and buttons - collapsed state', () => {
            render(<NavigationSidebar />, {
                wrapper: ({ children }) => (
                    <SidebarContext.Provider
                        value={{
                            isCollapsed: true,
                            toggleCollapse: mockToggleCollapse,
                        }}
                    >
                        {children}
                    </SidebarContext.Provider>
                ),
            })
            expect(screen.getByText('UserItem')).toBeInTheDocument()
            expect(screen.getByText('NotificationsButton')).toBeInTheDocument()
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThanOrEqual(1)
        })

        it('should render collapse toggle button', () => {
            render(<NavigationSidebar />, { wrapper })
            const collapseButton = screen.getByRole('button', {
                name: /collapse sidebar/i,
            })
            expect(collapseButton).toBeInTheDocument()
        })

        it('should call toggleCollapse when collapse button is clicked', async () => {
            const user = userEvent.setup()
            render(<NavigationSidebar />, { wrapper })

            const collapseButton = screen.getByRole('button', {
                name: /collapse sidebar/i,
            })
            await user.click(collapseButton)

            expect(mockToggleCollapse).toHaveBeenCalledTimes(1)
        })

        it('should call toggleChat when help button is clicked', async () => {
            const user = userEvent.setup()
            render(<NavigationSidebar />, { wrapper })

            const toggleChatButton = screen.getByRole('button', {
                name: /open chat/i,
            })
            await user.click(toggleChatButton)

            expect(mockToggleChat).toHaveBeenCalledTimes(1)
        })
    })

    describe('sticky products (Settings)', () => {
        beforeEach(() => {
            useCurrentRouteProductMock.mockReturnValue(
                productConfig[Product.Settings],
            )
        })

        it('should render product name button for sticky products', () => {
            render(<NavigationSidebar />, { wrapper })
            expect(screen.getByText('Settings')).toBeInTheDocument()
        })

        it('should render SettingsSidebar content', () => {
            render(<NavigationSidebar />, { wrapper })
            expect(screen.getByText('SettingsSidebar')).toBeInTheDocument()
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
                render(<NavigationSidebar />, { wrapper })
                expect(screen.getByText(expectedSidebar)).toBeInTheDocument()
            },
        )
    })
})
