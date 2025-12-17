import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { mockListShopifyOrderMetafieldsHandler } from '@gorgias/helpdesk-mocks'

import { AfterContent, DraftOrderContext, Wrapper } from './DraftOrder'

jest.mock('@repo/feature-flags')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const mockStore = configureMockStore()
const store = mockStore({
    currentAccount: fromJS({ domain: 'test-domain' }),
})

const mockListShopifyOrderMetafields = mockListShopifyOrderMetafieldsHandler()

const server = setupServer()
let queryClient: QueryClient

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    server.use(mockListShopifyOrderMetafields.handler)
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('Wrapper', () => {
    it('should provide DraftOrderContext with correct values from source and render children', () => {
        const source = fromJS({
            id: 12345,
            name: 'Draft Order #1001',
            created_at: '2024-01-15T10:00:00Z',
            total_price: '150.00',
            currency: 'USD',
        })

        const TestChild = () => {
            const { draftOrderId, integrationId } =
                React.useContext(DraftOrderContext)
            return (
                <div>
                    <span>Draft Order ID: {draftOrderId}</span>
                    <span>Integration ID: {integrationId}</span>
                </div>
            )
        }

        const IntegrationContext =
            require('providers/infobar/IntegrationContext').IntegrationContext

        render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integrationId: 789,
                        integration: fromJS({
                            meta: { shop_name: 'test-shop' },
                        }),
                    }}
                >
                    <Wrapper source={source}>
                        <TestChild />
                    </Wrapper>
                </IntegrationContext.Provider>
            </Provider>,
        )

        expect(screen.getByText('Draft Order ID: 12345')).toBeInTheDocument()
        expect(screen.getByText('Integration ID: 789')).toBeInTheDocument()
    })

    it('should extract draftOrderId from source Map', () => {
        const source = fromJS({
            id: 99999,
            name: 'Test Draft Order',
        })

        const TestChild = () => {
            const { draftOrderId } = React.useContext(DraftOrderContext)
            return <div>ID: {draftOrderId}</div>
        }

        const IntegrationContext =
            require('providers/infobar/IntegrationContext').IntegrationContext

        render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integrationId: 123,
                        integration: fromJS({}),
                    }}
                >
                    <Wrapper source={source}>
                        <TestChild />
                    </Wrapper>
                </IntegrationContext.Provider>
            </Provider>,
        )

        expect(screen.getByText('ID: 99999')).toBeInTheDocument()
    })

    it('should get integrationId from IntegrationContext', () => {
        const source = fromJS({ id: 111 })

        const TestChild = () => {
            const { integrationId } = React.useContext(DraftOrderContext)
            return <div>Integration: {integrationId}</div>
        }

        const IntegrationContext =
            require('providers/infobar/IntegrationContext').IntegrationContext

        render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integrationId: 456,
                        integration: fromJS({}),
                    }}
                >
                    <Wrapper source={source}>
                        <TestChild />
                    </Wrapper>
                </IntegrationContext.Provider>
            </Provider>,
        )

        expect(screen.getByText('Integration: 456')).toBeInTheDocument()
    })
})

describe('AfterContent', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return null when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        const { container } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DraftOrderContext.Provider
                        value={{ draftOrderId: 123, integrationId: 456 }}
                    >
                        <AfterContent isEditing={false} />
                    </DraftOrderContext.Provider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null when isEditing is true even if flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)

        const { container } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DraftOrderContext.Provider
                        value={{ draftOrderId: 123, integrationId: 456 }}
                    >
                        <AfterContent isEditing={true} />
                    </DraftOrderContext.Provider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render DraftOrderMetafields when flag is enabled and not editing', async () => {
        mockUseFlag.mockReturnValue(true)

        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DraftOrderContext.Provider
                        value={{ draftOrderId: 12345, integrationId: 789 }}
                    >
                        <AfterContent isEditing={false} />
                    </DraftOrderContext.Provider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            await screen.findByText('Draft Order Metafields'),
        ).toBeInTheDocument()
    })

    it('should return null when feature flag is disabled regardless of isEditing value', () => {
        mockUseFlag.mockReturnValue(false)

        const { container: container1 } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DraftOrderContext.Provider
                        value={{ draftOrderId: 123, integrationId: 456 }}
                    >
                        <AfterContent isEditing={false} />
                    </DraftOrderContext.Provider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(container1.firstChild).toBeNull()

        const { container: container2 } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DraftOrderContext.Provider
                        value={{ draftOrderId: 123, integrationId: 456 }}
                    >
                        <AfterContent isEditing={true} />
                    </DraftOrderContext.Provider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(container2.firstChild).toBeNull()
    })
})
