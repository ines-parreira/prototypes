import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'

import {
    mockListMetafieldDefinitionsHandler,
    mockMetafieldDefinition,
    mockUpdateMetafieldDefinitionHandler,
} from '@gorgias/helpdesk-mocks'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { mockStore } from 'utils/testing'

import ShopifyMetafields from './ShopifyMetafields'

jest.mock('hooks/useAppSelector')

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>

const INTEGRATION_ID = 123

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('ShopifyMetafields', () => {
    let queryClient: QueryClient

    const renderComponent = () => {
        const store = mockStore({})
        return render(
            <MemoryRouter
                initialEntries={[`/integrations/${INTEGRATION_ID}/settings`]}
            >
                <Route path="/integrations/:id/settings">
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <ShopifyMetafields />
                        </QueryClientProvider>
                    </Provider>
                </Route>
            </MemoryRouter>,
        )
    }

    function setupEmptyListHandler() {
        const mockListHandler = mockListMetafieldDefinitionsHandler(async () =>
            HttpResponse.json({
                data: [],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list',
                uri: `/api/integrations/${INTEGRATION_ID}/metafield-definitions`,
            }),
        )
        server.use(mockListHandler.handler)
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        mockUseAppSelector.mockImplementation((selector: any) => {
            if (selector === getCurrentAccountId) {
                return 1
            }
            if (selector === getCurrentUserId) {
                return 2
            }
            return undefined
        })

        const mockUpdateHandler = mockUpdateMetafieldDefinitionHandler()
        server.use(mockUpdateHandler.handler)
    })

    afterEach(() => {
        queryClient.clear()
    })

    it('should render the explainer text correctly', async () => {
        setupEmptyListHandler()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText(/Manage/, { exact: false }),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByText(
                /from your Shopify store to Gorgias and choose which ones to show in each customer's profile/,
                { exact: false },
            ),
        ).toBeInTheDocument()
    })

    it('should render the MetafieldsTable component with data', async () => {
        const mockListHandler = mockListMetafieldDefinitionsHandler(async () =>
            HttpResponse.json({
                data: [
                    mockMetafieldDefinition({
                        id: '1',
                        name: 'Customer Email',
                        type: 'single_line_text_field',
                        ownerType: 'Customer',
                        isVisible: true,
                    }),
                    mockMetafieldDefinition({
                        id: '2',
                        name: 'Order Notes',
                        type: 'multi_line_text_field',
                        ownerType: 'Order',
                        isVisible: false,
                    }),
                ],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list',
                uri: `/api/integrations/${INTEGRATION_ID}/metafield-definitions`,
            }),
        )
        server.use(mockListHandler.handler)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
        })

        expect(screen.getByText('Order Notes')).toBeInTheDocument()
    })

    it('should render the table structure', async () => {
        setupEmptyListHandler()
        renderComponent()

        await waitFor(() => {
            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        expect(
            screen.getByRole('button', { name: /import/i }),
        ).toBeInTheDocument()
    })

    it('should show loading state while fetching data', async () => {
        const mockListHandler = mockListMetafieldDefinitionsHandler(
            () => new Promise(() => {}),
        )
        server.use(mockListHandler.handler)

        renderComponent()

        await waitFor(() => {
            expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(
                1,
            )
        })
    })

    it('should render metafields styled text with correct class', async () => {
        setupEmptyListHandler()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText(/Manage/, { exact: false }),
            ).toBeInTheDocument()
        })

        const metafieldsSpan = screen
            .getByText(/Manage/)
            .closest('p')
            ?.querySelector('span')
        expect(metafieldsSpan).toBeInTheDocument()
        expect(metafieldsSpan).toHaveTextContent('metafields')
    })
})
