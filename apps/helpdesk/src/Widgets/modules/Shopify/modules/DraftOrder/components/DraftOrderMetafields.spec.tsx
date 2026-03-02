import { logEvent, SegmentEvent } from '@repo/logging'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { mockListMetafieldDefinitionsHandler } from '@gorgias/helpdesk-mocks'

import type { IntegrationContextType } from 'providers/infobar/IntegrationContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import WrappedDraftOrderMetafields, {
    DraftOrderMetafields,
} from './DraftOrderMetafields'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ShopifyMetafieldsOpenDraftOrder: 'shopify_metafields_open_draft_order',
    },
}))

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

const mockStore = configureMockStore()
const store = mockStore({
    currentAccount: fromJS({ domain: 'domain' }),
})

const integrationContext: IntegrationContextType = {
    integration: Map<string, unknown>(
        fromJS({
            name: 'test-store',
        }),
    ),
    integrationId: 1,
}

const server = setupServer()

const createMockDefinitions = (
    metafields: { namespace: string; key: string }[],
) =>
    metafields.map((mf, index) => ({
        id: String(index + 1),
        namespace: mf.namespace,
        key: mf.key,
        name: mf.key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        ownerType: 'DraftOrder' as const,
        type: 'single_line_text_field' as const,
    }))

const mockListMetafieldDefinitions = mockListMetafieldDefinitionsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [],
        }),
)

let queryClient: QueryClient

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
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
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('DraftOrderMetafields', () => {
    describe('empty state', () => {
        it.each([
            {
                scenario: 'metafields is undefined',
                metafields: undefined,
            },
            {
                scenario: 'metafields is empty array',
                metafields: [],
            },
        ])('should render info message when $scenario', ({ metafields }) => {
            renderWithProviders(
                <DraftOrderMetafields metafields={metafields} />,
            )

            expect(
                screen.getByText('Draft order has no metafields populated.'),
            ).toBeInTheDocument()
        })
    })

    describe('successful data rendering', () => {
        it('should render metafields when data is available', async () => {
            const metafields = [
                {
                    type: 'single_line_text_field' as const,
                    namespace: 'custom',
                    key: 'custom_field_1',
                    value: 'value_1',
                },
                {
                    type: 'single_line_text_field' as const,
                    namespace: 'custom',
                    key: 'custom_field_2',
                    value: 'value_2',
                },
            ]

            server.use(
                mockListMetafieldDefinitionsHandler(async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: createMockDefinitions(metafields),
                    }),
                ).handler,
            )

            renderWithProviders(
                <DraftOrderMetafields metafields={metafields} />,
            )

            await waitFor(() => {
                expect(screen.getByText('Custom Field 1:')).toBeInTheDocument()
            })
            expect(screen.getByText('value_1')).toBeInTheDocument()
            expect(screen.getByText('Custom Field 2:')).toBeInTheDocument()
            expect(screen.getByText('value_2')).toBeInTheDocument()
        })

        it('should render all metafields from the props', async () => {
            const metafields = Array.from({ length: 5 }, (_, i) => ({
                type: 'single_line_text_field' as const,
                namespace: 'custom',
                key: `field_${i + 1}`,
                value: `value_${i + 1}`,
            }))

            server.use(
                mockListMetafieldDefinitionsHandler(async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: createMockDefinitions(metafields),
                    }),
                ).handler,
            )

            renderWithProviders(
                <DraftOrderMetafields metafields={metafields} />,
            )

            await waitFor(() => {
                expect(screen.getByText('Field 1:')).toBeInTheDocument()
            })
            for (let i = 1; i <= 5; i++) {
                expect(screen.getByText(`Field ${i}:`)).toBeInTheDocument()
                expect(screen.getByText(`value_${i}`)).toBeInTheDocument()
            }
        })
    })
})

describe('WrappedDraftOrderMetafields', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render expanded by default with MetafieldsContainer wrapper', async () => {
        const metafields = [
            {
                type: 'single_line_text_field' as const,
                namespace: 'custom',
                key: 'custom_field_1',
                value: 'value_1',
            },
        ]

        server.use(
            mockListMetafieldDefinitionsHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: createMockDefinitions(metafields),
                }),
            ).handler,
        )

        renderWithProviders(
            <WrappedDraftOrderMetafields metafields={metafields} />,
        )

        expect(screen.getByText('Draft Order Metafields')).toBeInTheDocument()
        expect(screen.getByTitle('Fold this card')).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByText('Custom Field 1:')).toBeInTheDocument()
        })
        expect(screen.getByText('value_1')).toBeInTheDocument()
    })

    it('should log segment event when reopened after being collapsed', () => {
        renderWithProviders(<WrappedDraftOrderMetafields metafields={[]} />)

        const foldButton = screen.getByTitle('Fold this card')
        fireEvent.click(foldButton)

        expect(mockLogEvent).not.toHaveBeenCalled()

        const unfoldButton = screen.getByTitle('Unfold this card')
        fireEvent.click(unfoldButton)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.ShopifyMetafieldsOpenDraftOrder,
        )
    })

    it('should collapse when toggle button is clicked', async () => {
        const metafields = [
            {
                type: 'single_line_text_field' as const,
                namespace: 'custom',
                key: 'custom_field_1',
                value: 'value_1',
            },
        ]

        server.use(
            mockListMetafieldDefinitionsHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: createMockDefinitions(metafields),
                }),
            ).handler,
        )

        renderWithProviders(
            <WrappedDraftOrderMetafields metafields={metafields} />,
        )

        await waitFor(() => {
            expect(screen.getByText('Custom Field 1:')).toBeInTheDocument()
        })
        expect(screen.getByText('value_1')).toBeInTheDocument()

        const toggleButton = screen.getByTitle('Fold this card')
        fireEvent.click(toggleButton)

        expect(screen.queryByText('Custom Field 1:')).not.toBeInTheDocument()
        expect(screen.queryByText('value_1')).not.toBeInTheDocument()
    })
})
