import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    useListMetafieldDefinitions,
    useListShopifyOrderMetafields,
} from '@gorgias/helpdesk-queries'
import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

import type { IntegrationContextType } from 'providers/infobar/IntegrationContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import WrappedOrderMetafields, { OrderMetafields } from '../OrderMetafields'

jest.mock('@gorgias/helpdesk-queries')

const mockUseListShopifyOrderMetafields =
    useListShopifyOrderMetafields as jest.Mock
const mockUseListMetafieldDefinitions = useListMetafieldDefinitions as jest.Mock

const mockStore = configureMockStore([thunk])()

const integrationContext: IntegrationContextType = {
    integration: Map<string, unknown>(
        fromJS({
            name: 'test-store',
        }),
    ),
    integrationId: 1,
}

let queryClient: QueryClient

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore}>
                <IntegrationContext.Provider value={integrationContext}>
                    {ui}
                </IntegrationContext.Provider>
            </Provider>
        </QueryClientProvider>,
    )
}

describe('<OrderMetafields/>', () => {
    beforeEach(() => {
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
        mockUseListMetafieldDefinitions.mockReturnValue({
            data: { data: { data: [] } },
        })
    })

    afterEach(() => {
        queryClient.clear()
    })

    it('should return loading state', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            isLoading: true,
            data: null,
        })

        const { container } = renderWithProviders(
            <OrderMetafields integrationId={1} orderId={1} />,
        )

        const elementsByClassName = container.getElementsByClassName('loader')

        expect(elementsByClassName[0]).toBeInTheDocument()
        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
    })

    it('should return error state', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            isError: true,
            data: null,
        })

        renderWithProviders(<OrderMetafields integrationId={1} orderId={1} />)

        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
        expect(
            screen.getByText('Temporarily unavailable, try again later.'),
        ).toBeInTheDocument()
    })

    it('should return empty state', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: {
                data: {
                    data: [],
                },
            },
        })

        renderWithProviders(<OrderMetafields integrationId={1} orderId={1} />)

        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
        expect(
            screen.getByText('Order has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return metafields', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: {
                data: {
                    data: [
                        {
                            type: 'single_line_text_field',
                            namespace: 'test_namespace',
                            key: 'test_key',
                            value: 'test_value',
                        },
                    ],
                },
            },
        })

        renderWithProviders(<OrderMetafields integrationId={1} orderId={1} />)

        expect(mockUseListShopifyOrderMetafields).toHaveBeenCalled()
        expect(screen.getByText('Test Key:')).toBeInTheDocument()
        expect(screen.getByText('test_value')).toBeInTheDocument()
    })

    it('should render source metafields when useSourceMetafields is true', () => {
        mockUseListMetafieldDefinitions.mockReturnValue({
            data: {
                data: {
                    data: [
                        {
                            namespace: 'test_namespace',
                            key: 'source_key',
                            name: 'Source Key',
                        },
                    ],
                },
            },
        })
        const sourceMetafields = [
            {
                type: 'single_line_text_field',
                namespace: 'test_namespace',
                key: 'source_key',
                value: 'source_value',
            },
        ] as ShopifyMetafield[]

        renderWithProviders(
            <OrderMetafields
                integrationId={1}
                orderId={1}
                metafields={sourceMetafields}
                useSourceMetafields={true}
            />,
        )

        expect(screen.getByText('Source Key:')).toBeInTheDocument()
        expect(screen.getByText('source_value')).toBeInTheDocument()
    })

    it('should return empty state when API returns undefined data', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: {
                data: {},
            },
        })

        renderWithProviders(<OrderMetafields integrationId={1} orderId={1} />)

        expect(
            screen.getByText('Order has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return empty state when useSourceMetafields is true but metafields is empty', () => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: null,
        })

        renderWithProviders(
            <OrderMetafields
                integrationId={1}
                orderId={1}
                metafields={[]}
                useSourceMetafields={true}
            />,
        )

        expect(
            screen.getByText('Order has no metafields populated.'),
        ).toBeInTheDocument()
    })
})

describe('<WrappedOrderMetafields/>', () => {
    beforeEach(() => {
        mockUseListShopifyOrderMetafields.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })
    })

    it('should render expanded by default when useSourceMetafields is true', () => {
        mockUseListMetafieldDefinitions.mockReturnValue({
            data: {
                data: {
                    data: [
                        {
                            namespace: 'test_namespace',
                            key: 'source_key',
                            name: 'Source Key',
                        },
                    ],
                },
            },
        })
        const sourceMetafields = [
            {
                type: 'single_line_text_field',
                namespace: 'test_namespace',
                key: 'source_key',
                value: 'source_value',
            },
        ] as ShopifyMetafield[]

        renderWithProviders(
            <WrappedOrderMetafields
                integrationId={1}
                orderId={1}
                metafields={sourceMetafields}
                useSourceMetafields={true}
            />,
        )

        expect(screen.getByTitle('Fold this card')).toBeInTheDocument()
        expect(screen.getByText('Source Key:')).toBeInTheDocument()
        expect(screen.getByText('source_value')).toBeInTheDocument()
    })

    it('should render collapsed by default when useSourceMetafields is false', () => {
        renderWithProviders(
            <WrappedOrderMetafields
                integrationId={1}
                orderId={1}
                useSourceMetafields={false}
            />,
        )

        expect(screen.getByTitle('Unfold this card')).toBeInTheDocument()
        expect(
            screen.queryByText('Order has no metafields populated.'),
        ).not.toBeInTheDocument()
    })

    it('should render collapsed by default when useSourceMetafields is undefined', () => {
        renderWithProviders(
            <WrappedOrderMetafields integrationId={1} orderId={1} />,
        )

        expect(screen.getByTitle('Unfold this card')).toBeInTheDocument()
    })
})
