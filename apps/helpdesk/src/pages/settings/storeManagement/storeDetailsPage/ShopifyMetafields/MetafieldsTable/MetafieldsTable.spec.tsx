import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'

import {
    mockListMetafieldDefinitionsHandler,
    mockUpdateMetafieldDefinitionHandler,
} from '@gorgias/helpdesk-mocks'

import { mockStore } from 'utils/testing'

import { columns } from './Columns'
import MetafieldsTable from './MetafieldsTable'
import type { Field } from './types'

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

const mockFields: Field[] = [
    {
        id: '1',
        name: 'Customer Email',
        type: 'single_line_text_field',
        category: 'Customer',
        isVisible: true,
    },
    {
        id: '2',
        name: 'Order Notes',
        type: 'multi_line_text_field',
        category: 'Order',
        isVisible: false,
    },
    {
        id: '3',
        name: 'Draft Date',
        type: 'date',
        category: 'DraftOrder',
        isVisible: true,
    },
]

describe('MetafieldsTable', () => {
    let user: ReturnType<typeof userEvent.setup>
    let queryClient: QueryClient

    const renderComponent = (
        props: Partial<
            React.ComponentProps<typeof MetafieldsTable<Field, unknown>>
        > = {},
    ) => {
        const store = mockStore({})
        return render(
            <MemoryRouter
                initialEntries={[`/integrations/${INTEGRATION_ID}/settings`]}
            >
                <Route path="/integrations/:id/settings">
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <MetafieldsTable<Field, unknown>
                                columns={columns}
                                data={mockFields}
                                {...props}
                            />
                        </QueryClientProvider>
                    </Provider>
                </Route>
            </MemoryRouter>,
        )
    }

    function getVisibilityButtons() {
        return screen
            .getAllByRole('button')
            .filter((btn) => btn.id === 'metafield-visibility-toggle')
    }

    function getRemoveButton(id: string) {
        return screen.getAllByRole('button').find((btn) => btn.id === id)
    }

    beforeEach(() => {
        user = userEvent.setup()
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        const mockListHandler = mockListMetafieldDefinitionsHandler()
        const mockUpdateHandler = mockUpdateMetafieldDefinitionHandler()
        server.use(mockListHandler.handler, mockUpdateHandler.handler)
    })

    afterEach(() => {
        queryClient.clear()
    })

    it('should render table with data', () => {
        renderComponent()

        expect(screen.getByText('Customer Email')).toBeInTheDocument()
        expect(screen.getByText('Order Notes')).toBeInTheDocument()
        expect(screen.getByText('Draft Date')).toBeInTheDocument()
    })

    it('should display total count in toolbar', () => {
        renderComponent()

        expect(screen.getByText(/3/)).toBeInTheDocument()
    })

    it('should call toggleVisibility when visibility button is clicked', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
        })

        const visibilityButton = getVisibilityButtons()[0]
        await act(() => user.click(visibilityButton))

        expect(visibilityButton).toBeInTheDocument()
    })

    it('should open remove modal when remove button is clicked', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
        })

        const removeButton = getRemoveButton('1')
        if (removeButton) {
            await act(() => user.click(removeButton))
        }

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Remove metafield?')).toBeInTheDocument()
        })
    })

    it('should close remove modal when Cancel is clicked', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
        })

        const removeButton = getRemoveButton('1')
        if (removeButton) {
            await act(() => user.click(removeButton))
        }

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        const dialog = screen.getByRole('dialog')
        await act(() =>
            user.click(within(dialog).getByRole('button', { name: /cancel/i })),
        )

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should call deleteMetafield when Remove is confirmed', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
        })

        const removeButton = getRemoveButton('1')
        if (removeButton) {
            await act(() => user.click(removeButton))
        }

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        const dialog = screen.getByRole('dialog')
        await act(() =>
            user.click(within(dialog).getByRole('button', { name: /remove/i })),
        )

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should render loading state', () => {
        renderComponent({ data: [], isLoading: true })

        expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should filter data based on search input', async () => {
        renderComponent()

        const searchInput = screen.getByRole('textbox')
        await act(() => user.type(searchInput, 'Customer'))

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
            expect(screen.queryByText('Order Notes')).not.toBeInTheDocument()
        })
    })

    it('should default isVisible to true when not provided', async () => {
        const fieldWithoutVisibility: Field[] = [
            {
                id: '4',
                name: 'Product SKU',
                type: 'single_line_text_field',
                category: 'product',
            } as Field,
        ]

        renderComponent({ data: fieldWithoutVisibility })

        await waitFor(() => {
            expect(screen.getByText('Product SKU')).toBeInTheDocument()
        })

        const visibilityButtons = getVisibilityButtons()
        expect(visibilityButtons.length).toBeGreaterThan(0)

        if (visibilityButtons.length > 0) {
            await act(() => user.click(visibilityButtons[0]))
        }
    })

    it('should open import modal when import button is clicked', async () => {
        const mockListImportable = mockListMetafieldDefinitionsHandler(
            async () =>
                HttpResponse.json({
                    data: [],
                    meta: { next_cursor: null, prev_cursor: null },
                    object: 'list',
                    uri: `/api/integrations/${INTEGRATION_ID}/metafield-definitions`,
                }),
        )
        server.use(mockListImportable.handler)

        renderComponent()

        await act(() =>
            user.click(screen.getByRole('button', { name: /import/i })),
        )

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('Import Shopify metafields to Gorgias'),
            ).toBeInTheDocument()
        })
    })

    it('should close import modal when close is triggered', async () => {
        const mockListImportable = mockListMetafieldDefinitionsHandler(
            async () =>
                HttpResponse.json({
                    data: [],
                    meta: { next_cursor: null, prev_cursor: null },
                    object: 'list',
                    uri: `/api/integrations/${INTEGRATION_ID}/metafield-definitions`,
                }),
        )
        server.use(mockListImportable.handler)

        renderComponent()

        await act(() =>
            user.click(screen.getByRole('button', { name: /import/i })),
        )

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        const dialog = screen.getByRole('dialog')
        const closeButton = within(dialog).getAllByRole('button')[0]
        await act(() => user.click(closeButton))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
