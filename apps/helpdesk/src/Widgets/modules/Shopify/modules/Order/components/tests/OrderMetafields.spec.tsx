import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockListMetafieldDefinitionsHandler,
    mockListMetafieldDefinitionsResponse,
    mockListShopifyOrderMetafieldsHandler,
    mockListShopifyOrderMetafieldsResponse,
    mockMetafieldDefinition,
} from '@gorgias/helpdesk-mocks'
import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

import type { IntegrationContextType } from 'providers/infobar/IntegrationContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { OrderMetafields, WrappedOrderMetafields } from '../OrderMetafields'

const server = setupServer()
const mockStore = configureMockStore([thunk])()
let queryClient = mockQueryClient()

const integrationContext: IntegrationContextType = {
    integration: Map<string, unknown>(
        fromJS({
            name: 'test-store',
        }),
    ),
    integrationId: 1,
}

const textMetafield = {
    type: 'single_line_text_field',
    namespace: 'test_namespace',
    key: 'test_key',
    value: 'test_value',
} as ShopifyMetafield

const definition = {
    id: 'definition-id',
    namespace: 'test_namespace',
    key: 'source_key',
    name: 'Source Key',
    ownerType: 'ORDER',
    type: 'single_line_text_field',
}

const useDefinitionsHandler = (definitions: (typeof definition)[] = []) => {
    server.use(
        mockListMetafieldDefinitionsHandler(async () =>
            HttpResponse.json(
                mockListMetafieldDefinitionsResponse({
                    data: definitions.map((item) =>
                        mockMetafieldDefinition(item as never),
                    ),
                }),
            ),
        ).handler,
    )
}

const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = mockQueryClient()

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

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    useDefinitionsHandler()
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('<OrderMetafields/>', () => {
    it('should return loading state', () => {
        server.use(
            mockListShopifyOrderMetafieldsHandler(
                () => new Promise(() => undefined),
            ).handler,
        )

        const { container } = renderWithProviders(
            <OrderMetafields integrationId={1} orderId={1} />,
        )

        expect(
            container.getElementsByClassName('loader')[0],
        ).toBeInTheDocument()
    })

    it('should return error state', async () => {
        server.use(
            mockListShopifyOrderMetafieldsHandler(async () =>
                HttpResponse.json(
                    { error: 'Temporarily unavailable' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        renderWithProviders(<OrderMetafields integrationId={1} orderId={1} />)

        expect(
            await screen.findByText(
                'Temporarily unavailable, try again later.',
            ),
        ).toBeInTheDocument()
    })

    it('should return empty state', async () => {
        server.use(
            mockListShopifyOrderMetafieldsHandler(async () =>
                HttpResponse.json(
                    mockListShopifyOrderMetafieldsResponse({ data: [] }),
                ),
            ).handler,
        )

        renderWithProviders(<OrderMetafields integrationId={1} orderId={1} />)

        expect(
            await screen.findByText('Order has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return metafields', async () => {
        server.use(
            mockListShopifyOrderMetafieldsHandler(async () =>
                HttpResponse.json(
                    mockListShopifyOrderMetafieldsResponse({
                        data: [textMetafield],
                    }),
                ),
            ).handler,
        )

        renderWithProviders(<OrderMetafields integrationId={1} orderId={1} />)

        expect(await screen.findByText('Test Key:')).toBeInTheDocument()
        expect(screen.getByText('test_value')).toBeInTheDocument()
    })

    it('should render source metafields when useSourceMetafields is true', async () => {
        useDefinitionsHandler([definition])
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

        expect(await screen.findByText('Source Key:')).toBeInTheDocument()
        expect(screen.getByText('source_value')).toBeInTheDocument()
    })

    it('should return empty state when API returns undefined data', async () => {
        server.use(
            mockListShopifyOrderMetafieldsHandler(async () =>
                HttpResponse.json({} as never),
            ).handler,
        )

        renderWithProviders(<OrderMetafields integrationId={1} orderId={1} />)

        expect(
            await screen.findByText('Order has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return empty state when useSourceMetafields is true but metafields is empty', async () => {
        useDefinitionsHandler([definition])

        renderWithProviders(
            <OrderMetafields
                integrationId={1}
                orderId={1}
                metafields={[]}
                useSourceMetafields={true}
            />,
        )

        expect(
            await screen.findByText('Order has no metafields populated.'),
        ).toBeInTheDocument()
    })
})

describe('<WrappedOrderMetafields/>', () => {
    it('should render expanded by default when useSourceMetafields is true', async () => {
        useDefinitionsHandler([definition])
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
        expect(await screen.findByText('Source Key:')).toBeInTheDocument()
        expect(screen.getByText('source_value')).toBeInTheDocument()
    })

    it('should render collapsed by default when useSourceMetafields is false', () => {
        server.use(
            mockListShopifyOrderMetafieldsHandler(async () =>
                HttpResponse.json(
                    mockListShopifyOrderMetafieldsResponse({ data: [] }),
                ),
            ).handler,
        )

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
        server.use(
            mockListShopifyOrderMetafieldsHandler(async () =>
                HttpResponse.json(
                    mockListShopifyOrderMetafieldsResponse({ data: [] }),
                ),
            ).handler,
        )

        renderWithProviders(
            <WrappedOrderMetafields integrationId={1} orderId={1} />,
        )

        expect(screen.getByTitle('Unfold this card')).toBeInTheDocument()
    })
})
