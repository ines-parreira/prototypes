import React from 'react'
import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {QueryClientProvider} from '@tanstack/react-query'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import ConvertBundleDetail from '../ConvertBundleDetail'

const mockStore = configureMockStore([thunk])

const queryClient = mockQueryClient()
describe('ConvertBundleDetail', () => {
    beforeEach(() => {
        queryClient.clear()
    })
    it('renders chat integration details if provided', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertBundleDetail
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
            </QueryClientProvider>
        )

        expect(screen.getByText(/Test Chat Integration/)).toBeInTheDocument()
        expect(screen.getByText(/Manage Chat/)).toBeInTheDocument()
    })

    it('renders store integration details if provided', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertBundleDetail
                        storeIntegration={fromJS({
                            id: 1,
                            name: 'Test Store Integration',
                            type: SHOPIFY_INTEGRATION_TYPE,
                        })}
                    />
                </Provider>
            </QueryClientProvider>
        )

        expect(screen.getByText(/Test Store Integration/)).toBeInTheDocument()
    })

    it('renders campaign bundle installation method section', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertBundleDetail />
                </Provider>
            </QueryClientProvider>
        )

        expect(
            screen.getByText(/Campaign bundle installation method/)
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Installing the campaign bundle is required/)
        ).toBeInTheDocument()
    })
})
