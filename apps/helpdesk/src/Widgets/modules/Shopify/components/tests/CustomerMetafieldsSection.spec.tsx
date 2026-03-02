import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { mockListMetafieldDefinitionsHandler } from '@gorgias/helpdesk-mocks'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { ShopifyContext } from 'Widgets/modules/Shopify/contexts/ShopifyContext'

import CustomerMetafieldsSection from '../CustomerMetafieldsSection'

jest.mock('@repo/feature-flags')
const mockUseFlag = assumeMock(useFlag)

const mockStore = configureMockStore()
const store = mockStore({
    currentAccount: fromJS({ domain: 'domain' }),
})

const server = setupServer()

const mockListMetafieldDefinitions = mockListMetafieldDefinitionsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [],
        }),
)

let queryClient: QueryClient

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('<CustomerMetafieldsSection />', () => {
    const mockShopifyContextValue = {
        data_source: 'Customer' as const,
        widget_resource_ids: {
            target_id: 123,
            customer_id: null,
        },
    }

    const mockIntegrationContextValue = {
        integration: fromJS({}),
        integrationId: 456,
        meta: {
            store_url: 'example.example.com',
            admin_url_suffix: '',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
            logger: {
                log: jest.fn(),
                warn: console.warn,
                error: () => {},
            },
        })
        server.use(mockListMetafieldDefinitions.handler)
    })

    afterEach(() => {
        queryClient.clear()
    })

    const renderComponent = (isEditing: boolean) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <ShopifyContext.Provider value={mockShopifyContextValue}>
                        <IntegrationContext.Provider
                            value={mockIntegrationContextValue}
                        >
                            <CustomerMetafieldsSection isEditing={isEditing} />
                        </IntegrationContext.Provider>
                    </ShopifyContext.Provider>
                </Provider>
            </QueryClientProvider>,
        )
    }

    describe('when isEditing is false', () => {
        it('should render WrappedCustomerMetafields', () => {
            renderComponent(false)

            expect(screen.getByText('Customer Metafields')).toBeInTheDocument()
        })
    })

    describe('when isEditing is true', () => {
        it('should render null', () => {
            const { container } = renderComponent(true)

            expect(container.firstChild).toBeNull()
        })
    })
})
