import { act, fireEvent, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Magento2Integration } from 'models/integration/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import MagentoSettings from '../MagentoSettings'

const mockStore = configureMockStore([thunk])
const store = mockStore({})
const { QueryClientProvider } = mockQueryClientProvider()

const renderComponent = (element: React.ReactElement) => {
    return renderWithRouter(
        <Provider store={store}>
            <QueryClientProvider>{element}</QueryClientProvider>
        </Provider>,
    )
}

describe('<MagentoSettings/>', () => {
    const minProps = {
        integration: {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
            },
        } as Magento2Integration,
        onDeleteIntegration: jest.fn(),
        redirectUri: 'https://example.com/auth',
        refetchStore: jest.fn(),
    }

    beforeEach(() => {
        jest.restoreAllMocks()
    })

    it('should render manual form when integration is manual', () => {
        const integration = {
            meta: {
                store_url: 'gorgias.test.com',
                admin_url_suffix: 'admin',
                is_manual: true,
            },
        } as Magento2Integration

        renderComponent(
            <MagentoSettings {...minProps} integration={integration} />,
        )

        expect(screen.getByText('Store Information')).toBeInTheDocument()
        expect(
            screen.getByText('https://gorgias.test.com/'),
        ).toBeInTheDocument()
        expect(screen.getByDisplayValue('admin')).toBeInTheDocument()
    })

    it('should render one-click form when integration is not manual', () => {
        const integration = {
            meta: {
                store_url: 'gorgias.test.com',
                admin_url_suffix: 'admin',
                is_manual: false,
            },
        } as Magento2Integration

        renderComponent(
            <MagentoSettings {...minProps} integration={integration} />,
        )

        expect(screen.getByText('Store Information')).toBeInTheDocument()
        expect(
            screen.getByText('https://gorgias.test.com/'),
        ).toBeInTheDocument()
        expect(screen.getByDisplayValue('admin')).toBeInTheDocument()
    })

    it('should handle integration deletion', () => {
        const onDeleteIntegration = jest.fn()
        const integration = {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
            },
        } as Magento2Integration

        renderComponent(
            <MagentoSettings
                {...minProps}
                integration={integration}
                onDeleteIntegration={onDeleteIntegration}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: /Delete Store/i }))
        expect(onDeleteIntegration).toHaveBeenCalledWith(integration)
    })

    it('should handle form reset', () => {
        const integration = {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
                is_manual: true,
            },
        } as Magento2Integration

        renderComponent(
            <MagentoSettings {...minProps} integration={integration} />,
        )
        const saveButton = screen.getByRole('button', { name: 'Save Changes' })
        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        const input = screen.getByRole('textbox', {
            name: 'Consumer key',
        })
        fireEvent.change(input, { target: { value: 'new value' } })
        expect(saveButton).toHaveAttribute('aria-disabled', 'false')
        expect(input).toHaveValue('new value')

        fireEvent.click(cancelButton)
        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        expect(input).toHaveValue('')
    })

    it('should handle reconnect', () => {
        const integration = {
            deactivated_datetime: '2024-01-01T10:00:00Z',
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
                is_manual: false,
            },
        } as Magento2Integration

        renderComponent(
            <MagentoSettings {...minProps} integration={integration} />,
        )
        const reconnectButton = screen.getByRole('button', {
            name: 'Reconnect',
        })
        fireEvent.click(reconnectButton)
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

        expect(window.location.href).toContain(
            'https://example.com/auth?store_url=https://test-store.com&admin_url_suffix=admin',
        )
    })

    it('should show UnsavedChangesModal when there are unsaved changes and user navigates away - manual form', async () => {
        const integration = {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
                is_manual: true,
            },
        } as Magento2Integration

        const { history } = renderComponent(
            <MagentoSettings {...minProps} integration={integration} />,
        )

        const input = screen.getByRole('textbox', {
            name: 'Consumer key',
        })
        fireEvent.change(input, { target: { value: 'new value' } })

        await act(async () => {
            history.push('/different-route')
        })

        expect(screen.queryByText('Save changes?')).toBeInTheDocument()
    })

    it('should show UnsavedChangesModal when there are unsaved changes and user navigates away - one click form', async () => {
        const integration = {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
                is_manual: false,
            },
        } as Magento2Integration

        const { history } = renderComponent(
            <MagentoSettings {...minProps} integration={integration} />,
        )

        const input = screen.getByPlaceholderText('ex: admin_45f1c')
        fireEvent.change(input, { target: { value: 'new value' } })

        await act(async () => {
            history.push('/different-route')
        })

        expect(screen.queryByText('Save changes?')).toBeInTheDocument()
    })

    it('should not show UnsavedChangesModal when there are no unsaved changes', async () => {
        const integration = {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
                is_manual: true,
            },
        } as Magento2Integration

        const { history } = renderComponent(
            <MagentoSettings {...minProps} integration={integration} />,
        )

        await act(async () => {
            history.push('/different-route')
        })

        expect(screen.queryByText('Save changes?')).not.toBeInTheDocument()
    })

    it('should call handleUpdate when Save Changes button is clicked in UnsavedChangesModal', async () => {
        const mockHandleUpdate = jest.fn()
        const integration = {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
                is_manual: true,
            },
        } as Magento2Integration

        const mockUseManualForm = {
            defaultValues: {
                adminURLSuffix: 'admin',
                consumerKey: '',
                consumerSecret: '',
                accessToken: '',
                accessTokenSecret: '',
            },
            isSubmitting: false,
            handleUpdate: mockHandleUpdate,
            storeURL: 'https://test-store.com',
        }

        jest.spyOn(
            require('../hooks/useManualForm'),
            'useManualForm',
        ).mockReturnValue(mockUseManualForm)

        const { history } = renderComponent(
            <MagentoSettings {...minProps} integration={integration} />,
        )

        const input = screen.getByRole('textbox', {
            name: 'Consumer key',
        })
        fireEvent.change(input, { target: { value: 'test-key' } })

        await act(async () => {
            history.push('/different-route')
        })

        expect(screen.getByText('Save changes?')).toBeInTheDocument()
        const dialog = screen.getByRole('dialog')
        const saveButton = within(dialog).getByRole('button', {
            name: 'Save Changes',
        })
        fireEvent.click(saveButton)

        expect(mockHandleUpdate).toHaveBeenCalledWith({
            adminURLSuffix: 'admin',
            consumerKey: 'test-key',
            consumerSecret: '',
            accessToken: '',
            accessTokenSecret: '',
        })
    })
})
