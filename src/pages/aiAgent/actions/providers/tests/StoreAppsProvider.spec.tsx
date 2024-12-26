import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'

import {useGetStoreApps} from 'models/workflows/queries'
import useAddStoreApp from 'pages/aiAgent/actions/hooks/useAddStoreApp'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {mockStore} from 'utils/testing'

import StoreAppsContext from '../StoreAppsContext'
import StoreAppsProvider from '../StoreAppsProvider'

jest.mock('models/workflows/queries')
jest.mock('pages/aiAgent/actions/hooks/useAddStoreApp')

const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)

const mockAddStoreApp = jest.fn()

mockUseGetStoreApps.mockReturnValue({
    data: [],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetStoreApps>)
mockUseAddStoreApp.mockReturnValue(mockAddStoreApp)

describe('<StoreAppsProvider />', () => {
    it('should use recharge integration id from store app', () => {
        mockUseGetStoreApps.mockReturnValue({
            data: [
                {
                    store_type: 'shopify',
                    store_name: 'acme',
                    account_id: 1,
                    integration_id: 1,
                    type: 'recharge',
                },
            ],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)

        renderWithQueryClientProvider(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [],
                    }),
                })}
            >
                <StoreAppsProvider storeName="acme" storeType="shopify">
                    <StoreAppsContext.Consumer>
                        {(contextValue) => {
                            return `Recharge integration: ${contextValue.recharge}`
                        }}
                    </StoreAppsContext.Consumer>
                </StoreAppsProvider>
            </Provider>
        )

        expect(screen.getByText('Recharge integration: 1')).toBeInTheDocument()
        expect(mockAddStoreApp).not.toHaveBeenCalled()
    })

    it('should use recharge integration from state and add store app', () => {
        mockUseGetStoreApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)

        renderWithQueryClientProvider(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                deleted_datetime: null,
                                meta: {
                                    store_name: 'acme',
                                    oauth: {
                                        status: 'success',
                                    },
                                },
                                deactivated_datetime: null,
                                type: 'recharge',
                                id: 1,
                            },
                        ],
                    }),
                })}
            >
                <StoreAppsProvider storeName="acme" storeType="shopify">
                    <StoreAppsContext.Consumer>
                        {(contextValue) => {
                            return `Recharge integration: ${contextValue.recharge}`
                        }}
                    </StoreAppsContext.Consumer>
                </StoreAppsProvider>
            </Provider>
        )

        expect(screen.getByText('Recharge integration: 1')).toBeInTheDocument()
        expect(mockAddStoreApp).toHaveBeenCalled()
    })

    it("should use recharge integration from store app and don't add store app as it already exists", () => {
        mockUseGetStoreApps.mockReturnValue({
            data: [
                {
                    store_type: 'shopify',
                    store_name: 'acme',
                    account_id: 1,
                    integration_id: 1,
                    type: 'recharge',
                },
            ],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)

        renderWithQueryClientProvider(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                deleted_datetime: null,
                                meta: {
                                    store_name: 'acme',
                                    oauth: {
                                        status: 'success',
                                    },
                                },
                                deactivated_datetime: null,
                                type: 'recharge',
                                id: 1,
                            },
                        ],
                    }),
                })}
            >
                <StoreAppsProvider storeName="acme" storeType="shopify">
                    <StoreAppsContext.Consumer>
                        {(contextValue) => {
                            return `Recharge integration: ${contextValue.recharge}`
                        }}
                    </StoreAppsContext.Consumer>
                </StoreAppsProvider>
            </Provider>
        )

        expect(screen.getByText('Recharge integration: 1')).toBeInTheDocument()
        expect(mockAddStoreApp).not.toHaveBeenCalled()
    })
})
