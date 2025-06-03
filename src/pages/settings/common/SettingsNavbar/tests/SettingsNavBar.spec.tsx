import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useLocation } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { logEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import { ProductType } from 'models/billing/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

import SettingsNavbar from '../SettingsNavbar'

window.scrollTo = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))
jest.mock('common/segment', () => ({
    ...jest.requireActual('common/segment'),
    logEvent: jest.fn(),
}))
jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: jest.fn(() => [
        {
            id: 1,
            name: 'Integration 1',
            type: 'shopify',
        },
    ]),
}))

jest.mock('core/flags')

const mockUseFlag = assumeMock(useFlag)
const mockStore = configureStore([])
const scrollToMock = jest.fn()

describe('SettingsNavbar', () => {
    const mockCurrentUser = fromJS({
        has_password: true,
        role: { name: 'admin' },
    })

    const mockAccount = fromJS({
        current_subscription: {
            products: {
                product_111: '111',
            },
        },
        domain: 'test-domain',
    })

    const mockLocation = {
        pathname: '/app/settings/profile',
    }

    beforeEach(() => {
        HTMLElement.prototype.scrollTo = jest.fn(scrollToMock)
        jest.clearAllMocks()
        ;(useLocation as jest.Mock).mockReturnValue(mockLocation)
        ;(logEvent as jest.Mock).mockImplementation(() => {})
    })

    const renderComponent = (
        store = mockStore({
            currentAccount: mockAccount,
            currentUser: mockCurrentUser,
            billing: fromJS({
                products: [
                    {
                        id: '111',
                        type: ProductType.Automation,
                        prices: [
                            {
                                product_id: 'product_111',
                                price_id: '111',
                            },
                        ],
                    },
                ],
            }),
        }),
    ) =>
        renderWithRouter(
            <Provider store={store}>
                <NavBarProvider>
                    <SettingsNavbar />
                </NavBarProvider>
            </Provider>,
        )

    it('renders navigation categories', () => {
        renderComponent()

        expect(screen.getByText('Productivity')).toBeInTheDocument()
        expect(screen.getByText('Apps')).toBeInTheDocument()
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.queryByText('Automate')).not.toBeInTheDocument()
    })

    it('handles category collapse/expand', async () => {
        renderComponent()

        const categoryTrigger = screen.getByText('Productivity')

        // Click to collapse
        fireEvent.click(categoryTrigger)

        expect(categoryTrigger.parentElement).toHaveAttribute(
            'aria-expanded',
            'false',
        )

        // Click to expand
        fireEvent.click(categoryTrigger)

        expect(categoryTrigger.parentElement).toHaveAttribute(
            'aria-expanded',
            'true',
        )
    })

    it('tracks navigation events when clicking links', () => {
        renderComponent()

        const firstLink = screen.getByText('Macros')
        fireEvent.click(firstLink)

        expect(logEvent).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                title: 'Macros',
                account_domain: 'test-domain',
            }),
        )
    })

    it('correctly highlights active navigation items', () => {
        renderComponent()

        const activeLink = screen.getByText('Your profile')
        expect(activeLink.closest('a')).toHaveAttribute('data-selected', 'true')
    })

    it('respects user roles for navigation items', () => {
        // Set user to non-admin
        const nonAdminStore = mockStore({
            currentAccount: mockAccount,
            currentUser: fromJS({
                has_password: true,
                role: { name: 'agent' },
            }),
            billing: fromJS({
                products: [
                    {
                        id: '111',
                        type: ProductType.Automation,
                        prices: [
                            {
                                product_id: 'product_111',
                                price_id: '111',
                            },
                        ],
                    },
                ],
            }),
        })

        renderComponent(nonAdminStore)

        // Admin-only items should not be visible
        expect(screen.queryByText('Users')).not.toBeInTheDocument()
    })

    it('renders Automate upgrade item when account does not have Automate', () => {
        renderComponent(
            mockStore({
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            product_111: '111',
                        },
                    },
                    domain: 'test-domain',
                }),
                currentUser: mockCurrentUser,
                billing: fromJS({
                    products: [],
                }),
            }),
        )

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('UPGRADE')).toBeInTheDocument()
    })

    it('renders store management item when MultiStore flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        expect(screen.getByText('Store Management')).toBeInTheDocument()
    })

    it('does not render store management item when MultiStore flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        renderComponent()

        expect(screen.queryByText('Store Management')).not.toBeInTheDocument()
    })
})
