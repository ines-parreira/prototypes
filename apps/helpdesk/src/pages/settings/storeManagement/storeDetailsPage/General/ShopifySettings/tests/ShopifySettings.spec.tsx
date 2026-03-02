import { act, fireEvent, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { ShopifyIntegration } from 'models/integration/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import type { ShopifySettingsProps } from '../ShopifySettings'
import ShopifySettings from '../ShopifySettings'

const mockStore = configureMockStore([thunk])
const store = mockStore({})
const { QueryClientProvider } = mockQueryClientProvider()

const findToggle = (name: string) =>
    screen
        .queryAllByRole('switch')
        .find(
            (toggle) =>
                toggle.closest('.featureRow')?.querySelector('label')
                    ?.textContent === name,
        )

const renderComponent = (element: React.ReactElement) => {
    return renderWithRouter(
        <Provider store={store}>
            <QueryClientProvider>{element}</QueryClientProvider>
        </Provider>,
    )
}

describe('<ShopifySettings/>', () => {
    const minProps: ShopifySettingsProps = {
        integration: {
            meta: {},
        } as ShopifyIntegration,
        onDeleteIntegration: jest.fn(),
        redirectUri: '',
        refetchStore: jest.fn(),
    }

    beforeEach(() => {
        jest.restoreAllMocks()
        ;(window as unknown as { location: Location }).location = {
            href: '',
        } as Location
    })

    it('should display store information form with correct initial values', () => {
        const integration = {
            meta: {
                shop_name: 'test-store',
                sync_customer_notes: true,
                default_address_phone_matching_enabled: false,
                import_state: {
                    customers: {
                        is_over: true,
                    },
                },
            },
        } as ShopifyIntegration

        renderComponent(
            <ShopifySettings {...minProps} integration={integration} />,
        )

        const syncNotesToggle = findToggle('Sync customer notes with Shopify')
        const matchingToggle = findToggle(
            'Enable customer matching with Shopify',
        )

        expect(syncNotesToggle).toHaveAttribute('aria-checked', 'true')
        expect(matchingToggle).toHaveAttribute('aria-checked', 'false')
    })

    it('should handle OAuth flow retrigger when update permissions is needed', () => {
        const integration = {
            meta: {
                shop_name: 'test-store',
                need_scope_update: true,
            },
        } as ShopifyIntegration

        renderComponent(
            <ShopifySettings
                {...minProps}
                integration={integration}
                redirectUri="https://example.com/{shop_name}/auth"
            />,
        )

        fireEvent.click(
            screen.getByRole('button', { name: 'Update Permissions' }),
        )
        expect(window.location.href).toBe('https://example.com/test-store/auth')
    })

    it('should handle reconnection when integration is deactivated', () => {
        const integration = {
            meta: {
                shop_name: 'test-store',
            },
            deactivated_datetime: '2024-03-20T10:00:00Z',
        } as ShopifyIntegration

        renderComponent(
            <ShopifySettings
                {...minProps}
                integration={integration}
                redirectUri="https://example.com/{shop_name}/auth"
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Reconnect' }))
        expect(window.location.href).toBe('https://example.com/test-store/auth')
    })

    it('should handle integration deletion', () => {
        const onDeleteIntegration = jest.fn()
        const integration = {
            meta: {
                shop_name: 'test-store',
            },
        } as ShopifyIntegration

        renderComponent(
            <ShopifySettings
                {...minProps}
                integration={integration}
                onDeleteIntegration={onDeleteIntegration}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: /Delete/i }))
        expect(onDeleteIntegration).toHaveBeenCalledWith(integration)
    })

    it('should show confirmation modal when enabling default address phone matching', () => {
        const integration = {
            meta: {
                shop_name: 'test-store',
                default_address_phone_matching_enabled: false,
            },
        } as ShopifyIntegration

        renderComponent(
            <ShopifySettings {...minProps} integration={integration} />,
        )

        const matchingToggle = findToggle(
            'Enable customer matching with Shopify',
        )
        fireEvent.click(matchingToggle!)

        fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

        expect(
            screen.getByText(/Are you sure you want to activate this setting/i),
        ).toBeInTheDocument()
    })

    it('should handle form cancellation', () => {
        const integration = {
            meta: {
                shop_name: 'test-store',
                sync_customer_notes: true,
                default_address_phone_matching_enabled: false,
            },
        } as ShopifyIntegration

        renderComponent(
            <ShopifySettings {...minProps} integration={integration} />,
        )

        const saveChangesButton = screen.getByRole('button', {
            name: 'Save Changes',
        })

        expect(saveChangesButton).toHaveAttribute('aria-disabled', 'true')

        const syncNotesToggle = findToggle('Sync customer notes with Shopify')
        const matchingToggle = findToggle(
            'Enable customer matching with Shopify',
        )
        expect(syncNotesToggle).toHaveAttribute('aria-checked', 'true')
        expect(matchingToggle).toHaveAttribute('aria-checked', 'false')

        fireEvent.click(syncNotesToggle!)
        expect(syncNotesToggle).toHaveAttribute('aria-checked', 'false')
        fireEvent.click(matchingToggle!)
        expect(matchingToggle).toHaveAttribute('aria-checked', 'true')

        expect(saveChangesButton).toHaveAttribute('aria-disabled', 'false')

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(syncNotesToggle).toHaveAttribute('aria-checked', 'true')
        expect(matchingToggle).toHaveAttribute('aria-checked', 'false')
        expect(saveChangesButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should show UnsavedChangesModal when there are unsaved changes and user navigates away', async () => {
        const integration = {
            meta: {
                shop_name: 'test-store',
                sync_customer_notes: true,
                default_address_phone_matching_enabled: false,
            },
        } as ShopifyIntegration

        const { history } = renderComponent(
            <ShopifySettings {...minProps} integration={integration} />,
        )

        const syncNotesToggle = findToggle('Sync customer notes with Shopify')

        fireEvent.click(syncNotesToggle!)

        await act(async () => {
            history.push('/different-route')
        })

        expect(screen.queryByText('Save changes?')).toBeInTheDocument()
    })

    it('should not show UnsavedChangesModal when there are no unsaved changes', async () => {
        const integration = {
            meta: {
                shop_name: 'test-store',
                sync_customer_notes: true,
                default_address_phone_matching_enabled: false,
            },
        } as ShopifyIntegration

        const { history } = renderComponent(
            <ShopifySettings {...minProps} integration={integration} />,
        )

        await act(async () => {
            history.push('/different-route')
        })

        expect(screen.queryByText('Save changes?')).not.toBeInTheDocument()
    })
})
