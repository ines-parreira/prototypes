import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ConvertBundleDetail from '../ConvertBundleDetail'

const mockStore = configureMockStore([thunk])

const queryClient = mockQueryClient()
describe('ConvertBundleDetail', () => {
    beforeEach(() => {
        queryClient.clear()
    })
    it('renders chat integration details if provided', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertBundleDetail
                        isConnectedToShopify={true}
                        isThemeAppExtensionInstallation={false}
                        chatIntegration={fromJS({
                            id: 1,
                            name: 'Test Chat Integration',
                            type: GORGIAS_CHAT_INTEGRATION_TYPE,
                            meta: {
                                shop_integration_id: 123,
                            },
                        })}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText(/Test Chat Integration/)).toBeInTheDocument()
        expect(screen.getByText(/Manage Chat/)).toBeInTheDocument()
    })

    it('renders store integration details if provided', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertBundleDetail
                        isConnectedToShopify={true}
                        isThemeAppExtensionInstallation={false}
                        storeIntegration={fromJS({
                            id: 1,
                            name: 'Test Store Integration',
                            type: SHOPIFY_INTEGRATION_TYPE,
                        })}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText(/Test Store Integration/)).toBeInTheDocument()
    })

    it('renders campaign bundle installation method section', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertBundleDetail
                        isConnectedToShopify={false}
                        isThemeAppExtensionInstallation={false}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(
            screen.getByText(/Campaign bundle installation method/),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Installing the campaign bundle is required/),
        ).toBeInTheDocument()
    })
})
