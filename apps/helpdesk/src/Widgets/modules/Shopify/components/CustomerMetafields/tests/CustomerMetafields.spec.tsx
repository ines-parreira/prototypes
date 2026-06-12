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
    mockListShopifyCustomerMetafieldsHandler,
    mockListShopifyCustomerMetafieldsResponse,
    mockMetafieldDefinition,
} from '@gorgias/helpdesk-mocks'
import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

import type { IntegrationContextType } from 'providers/infobar/IntegrationContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { CustomerMetafields } from '../CustomerMetafields'

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
    ownerType: 'CUSTOMER',
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

describe('<CustomerMetafields/>', () => {
    it('should return loading state', () => {
        server.use(
            mockListShopifyCustomerMetafieldsHandler(
                () => new Promise(() => undefined),
            ).handler,
        )

        const { container } = renderWithProviders(
            <CustomerMetafields integrationId={1} customerId={1} />,
        )

        expect(
            container.getElementsByClassName('loader')[0],
        ).toBeInTheDocument()
    })

    it('should return error state', async () => {
        server.use(
            mockListShopifyCustomerMetafieldsHandler(async () =>
                HttpResponse.json(
                    { error: 'Temporarily unavailable' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        renderWithProviders(
            <CustomerMetafields integrationId={1} customerId={1} />,
        )

        expect(
            await screen.findByText(
                'Temporarily unavailable, try again later.',
            ),
        ).toBeInTheDocument()
    })

    it('should return empty state', async () => {
        server.use(
            mockListShopifyCustomerMetafieldsHandler(async () =>
                HttpResponse.json(
                    mockListShopifyCustomerMetafieldsResponse({ data: [] }),
                ),
            ).handler,
        )

        renderWithProviders(
            <CustomerMetafields integrationId={1} customerId={1} />,
        )

        expect(
            await screen.findByText('Customer has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return metafields', async () => {
        server.use(
            mockListShopifyCustomerMetafieldsHandler(async () =>
                HttpResponse.json(
                    mockListShopifyCustomerMetafieldsResponse({
                        data: [textMetafield],
                    }),
                ),
            ).handler,
        )

        renderWithProviders(
            <CustomerMetafields integrationId={1} customerId={1} />,
        )

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
            <CustomerMetafields
                integrationId={1}
                customerId={1}
                metafields={sourceMetafields}
                useSourceMetafields={true}
            />,
        )

        expect(await screen.findByText('Source Key:')).toBeInTheDocument()
        expect(screen.getByText('source_value')).toBeInTheDocument()
    })

    it('should return empty state when API returns undefined data', async () => {
        server.use(
            mockListShopifyCustomerMetafieldsHandler(async () =>
                HttpResponse.json({} as never),
            ).handler,
        )

        renderWithProviders(
            <CustomerMetafields integrationId={1} customerId={1} />,
        )

        expect(
            await screen.findByText('Customer has no metafields populated.'),
        ).toBeInTheDocument()
    })

    it('should return empty state when useSourceMetafields is true but metafields is empty', async () => {
        useDefinitionsHandler([definition])

        renderWithProviders(
            <CustomerMetafields
                integrationId={1}
                customerId={1}
                metafields={[]}
                useSourceMetafields={true}
            />,
        )

        expect(
            await screen.findByText('Customer has no metafields populated.'),
        ).toBeInTheDocument()
    })
})
