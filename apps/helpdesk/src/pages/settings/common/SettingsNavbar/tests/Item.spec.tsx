import type { ComponentProps } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useLocation } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { ADMIN_ROLE } from 'config/user'
import { ProductType } from 'models/billing/types'
import { renderWithRouter } from 'utils/testing'

import Item from '../Item'

jest.mock('@repo/logging')
jest.mock(
    'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView',
    () => ({
        __esModule: true,
        default: jest.fn(),
    }),
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))

const mockStore = configureStore([])

window.scrollTo = jest.fn()

describe('Item', () => {
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
        pathname: '/app/settings/macros',
    }

    const renderComponent = (
        store = mockStore({
            currentAccount: mockAccount,
            currentUser: mockCurrentUser,
        }),
        props?: Partial<ComponentProps<typeof Item>>,
    ) =>
        renderWithRouter(
            <Provider store={store}>
                <Item to="macros" text="Macros" {...props} />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useLocation as jest.Mock).mockReturnValue(mockLocation)
    })

    it('renders the item', () => {
        const extra = 'plop'
        renderComponent(undefined, { extra })

        expect(screen.getByText(/Macros/)).toBeInTheDocument()
        expect(screen.getByText(new RegExp(extra, 'i'))).toBeInTheDocument()
    })

    it('does not render when user does not have required role', () => {
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
                                plan_id: '111',
                            },
                        ],
                    },
                ],
            }),
        })

        renderComponent(nonAdminStore, { requiredRole: ADMIN_ROLE })

        expect(screen.queryByText('Macros')).not.toBeInTheDocument()
    })

    it('does not render when shouldRender is false', () => {
        renderComponent(undefined, { shouldRender: false })

        expect(screen.queryByText('Macros')).not.toBeInTheDocument()
    })

    it('renders with correct active state when path matches', () => {
        renderComponent()

        expect(screen.getByText('Macros')).toHaveAttribute(
            'data-selected',
            'true',
        )
    })

    it('renders with correct active state when path does not match', () => {
        ;(useLocation as jest.Mock).mockReturnValue({
            pathname: '/app/settings/other',
        })
        renderComponent()

        expect(screen.getByText('Macros')).toHaveAttribute(
            'data-selected',
            'false',
        )
    })

    it('logs event when clicked', () => {
        renderComponent()

        screen.getByText('Macros').click()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.SettingsNavigationClicked,
            {
                title: 'Macros',
                account_domain: 'test-domain',
            },
        )
    })

    it('renders password-2fa with correct text', () => {
        renderComponent(undefined, {
            to: 'password-2fa',
            text: 'Password & 2FA',
        })

        expect(screen.getByText('Password & 2FA')).toBeInTheDocument()
    })

    it('renders correct text when user does not have password', () => {
        renderComponent(
            mockStore({
                currentUser: fromJS({
                    has_password: false,
                    role: { name: 'admin' },
                }),
            }),
            { to: 'password-2fa', text: 'Password & 2FA' },
        )

        expect(screen.getByText('2FA')).toBeInTheDocument()
    })

    it('handles special cases for integrations routes: Installed apps', () => {
        ;(useLocation as jest.Mock).mockReturnValue({
            pathname: '/app/settings/integrations/mine',
        })

        renderComponent(
            mockStore({
                currentUser: fromJS({
                    has_password: false,
                    role: { name: 'admin' },
                }),
            }),
            { to: 'integrations', text: 'Installed apps' },
        )

        expect(screen.getByText('Installed apps')).toHaveAttribute(
            'data-selected',
            'false',
        )
    })

    it('handles special cases for integrations routes: HTTP', () => {
        ;(useLocation as jest.Mock).mockReturnValue({
            pathname: '/app/settings/integrations/http',
        })

        renderComponent(
            mockStore({
                currentUser: fromJS({
                    has_password: false,
                    role: { name: 'admin' },
                }),
            }),
            { to: 'integrations', text: 'HTTP integration' },
        )

        expect(screen.getByText('HTTP integration')).toHaveAttribute(
            'data-selected',
            'false',
        )
    })

    it('uses default rootPath when not provided', () => {
        ;(useLocation as jest.Mock).mockReturnValue({
            pathname: '/app/settings/macros',
        })
        renderComponent()

        expect(screen.getByText('Macros')).toHaveAttribute(
            'data-selected',
            'true',
        )
    })

    it('uses custom rootPath when provided', () => {
        ;(useLocation as jest.Mock).mockReturnValue({
            pathname: '/app/workflows/macros',
        })
        renderComponent(undefined, { rootPath: '/app/workflows/' })

        expect(screen.getByText('Macros')).toHaveAttribute(
            'data-selected',
            'true',
        )
    })

    it('renders with correct active state when rootPath does not match but location pathname is settings', () => {
        ;(useLocation as jest.Mock).mockReturnValue({
            pathname: '/app/settings/macros',
        })
        renderComponent(undefined, { rootPath: '/app/workflows/' })

        expect(screen.getByText('Macros')).toHaveAttribute(
            'data-selected',
            'true',
        )
    })

    it('renders with correct inactive state when custom rootPath does not match', () => {
        ;(useLocation as jest.Mock).mockReturnValue({
            pathname: '/app/something-else/macros',
        })
        renderComponent(undefined, { rootPath: '/app/workflows/' })

        expect(screen.getByText('Macros')).toHaveAttribute(
            'data-selected',
            'false',
        )
    })
})
