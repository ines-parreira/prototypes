import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

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

jest.mock('routes/layout/sidebars', () => ({
    InboxSidebar: () => <div>InboxSidebar</div>,
    AiAgentSidebar: () => <div>AiAgentSidebar</div>,
    MarketingSidebar: () => <div>MarketingSidebar</div>,
    AnalyticsSidebar: () => <div>AnalyticsSidebar</div>,
    WorkflowsSidebar: () => <div>WorkflowsSidebar</div>,
    CustomersSidebar: () => <div>CustomersSidebar</div>,
    SettingsSidebar: () => <div>SettingsSidebar</div>,
}))

describe('NavigationSidebar', () => {
    describe('non-sticky products', () => {
        beforeEach(() => {
            useCurrentRouteProductMock.mockReturnValue(
                productConfig[Product.Inbox],
            )
        })

        it('should render SidebarProductHeader for non-sticky products', () => {
            render(<NavigationSidebar />)
            expect(screen.getByText('Inbox')).toHaveTextContent('Inbox')
        })

        it('should render action buttons in header', () => {
            render(<NavigationSidebar />)
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThanOrEqual(2)
        })

        it('should render InboxSidebar content', () => {
            render(<NavigationSidebar />)
            expect(screen.getByText('InboxSidebar')).toBeInTheDocument()
        })

        it('should render footer with UserItem and buttons', () => {
            render(<NavigationSidebar />)
            expect(screen.getByText('UserItem')).toBeInTheDocument()
            expect(screen.getByText('NotificationsButton')).toBeInTheDocument()
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThanOrEqual(1)
        })
    })

    describe('sticky products (Settings)', () => {
        beforeEach(() => {
            useCurrentRouteProductMock.mockReturnValue(
                productConfig[Product.Settings],
            )
        })

        it('should render product name button for sticky products', () => {
            render(<NavigationSidebar />)
            expect(screen.getByText('Settings')).toBeInTheDocument()
        })

        it('should render SettingsSidebar content', () => {
            render(<NavigationSidebar />)
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
                render(<NavigationSidebar />)
                expect(screen.getByText(expectedSidebar)).toBeInTheDocument()
            },
        )
    })
})
