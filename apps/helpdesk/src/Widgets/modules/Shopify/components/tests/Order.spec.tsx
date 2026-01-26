import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import { AfterContent, OrderContext } from '../Order'

jest.mock('@repo/feature-flags')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const mockStore = configureMockStore()
const store = mockStore({
    currentAccount: fromJS({ domain: 'test-domain' }),
})

let queryClient: QueryClient

beforeEach(() => {
    queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    jest.clearAllMocks()
})

afterEach(() => {
    queryClient.clear()
})

describe('AfterContent', () => {
    it('should render source metafields when useSourceMetafields flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)

        const sourceMetafields = [
            {
                type: 'single_line_text_field',
                namespace: 'test_namespace',
                key: 'source_key',
                value: 'source_value',
            },
        ]

        const source = fromJS({
            id: 12345,
            metafields: sourceMetafields,
        })

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <IntegrationContext.Provider
                        value={{
                            integrationId: 789,
                            integration: fromJS({}),
                        }}
                    >
                        <OrderContext.Provider
                            value={{
                                order: source,
                                orderId: 12345,
                                isOrderCancelled: false,
                                isOrderRefunded: false,
                                isOrderFulfilled: false,
                                isOrderPartiallyFulfilled: false,
                                isOldOrder: false,
                                integrationId: 789,
                                integration: fromJS({}),
                            }}
                        >
                            <AfterContent isEditing={false} source={source} />
                        </OrderContext.Provider>
                    </IntegrationContext.Provider>
                </QueryClientProvider>
            </Provider>,
        )

        fireEvent.click(screen.getByTitle('Unfold this card'))

        expect(screen.getByText('Source Key:')).toBeInTheDocument()
        expect(screen.getByText('source_value')).toBeInTheDocument()
    })
})
