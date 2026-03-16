import { screen, waitFor, within } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListWidgetsHandler,
    mockUpdateWidgetHandler,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../../tests/render.utils'
import { CustomActionsSection } from '../CustomActionsSection'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const shopifyWidget = {
    id: 1,
    type: 'shopify' as const,
    context: 'ticket' as const,
    template: {
        type: 'wrapper',
        widgets: [
            {
                path: 'customer',
                type: 'customer',
                meta: {
                    custom: {
                        links: [
                            {
                                label: 'Test Link',
                                url: 'https://example.com',
                            },
                        ],
                        buttons: [
                            {
                                label: 'Test Button',
                                action: {
                                    method: 'GET',
                                    url: 'https://api.example.com',
                                    headers: [],
                                    params: [],
                                    body: {
                                        contentType: 'application/json',
                                        'application/json': {},
                                        'application/x-www-form-urlencoded': [],
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        ],
    },
}

const widgetListResponse = {
    data: [shopifyWidget],
    meta: { next_cursor: null, prev_cursor: null },
    object: 'list' as unknown,
    uri: '/api/widgets',
}

const emptyCustomWidget = {
    ...shopifyWidget,
    template: {
        type: 'wrapper',
        widgets: [
            {
                path: 'customer',
                type: 'customer',
                meta: {
                    custom: {
                        links: [],
                        buttons: [],
                    },
                },
            },
        ],
    },
}

const emptyCustomWidgetListResponse = {
    data: [emptyCustomWidget],
    meta: { next_cursor: null, prev_cursor: null },
    object: 'list' as unknown,
    uri: '/api/widgets',
}

function renderComponent() {
    const listWidgetsMock = mockListWidgetsHandler(async () =>
        HttpResponse.json(widgetListResponse),
    )
    server.use(listWidgetsMock.handler)

    return render(<CustomActionsSection integrationName="Shopify" />)
}

describe('CustomActionsSection', () => {
    describe('Rendering', () => {
        it('renders integration name and Add button', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Shopify')).toBeInTheDocument()
            })

            expect(
                screen.getByRole('button', { name: /add/i }),
            ).toBeInTheDocument()
        })

        it('renders buttons and links', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Button')).toBeInTheDocument()
            })

            expect(screen.getByText('Test Link')).toBeInTheDocument()
        })

        it('does not render separator when no actions exist', async () => {
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json(emptyCustomWidgetListResponse),
            )
            server.use(listWidgetsMock.handler)

            render(<CustomActionsSection integrationName="Shopify" />)

            await waitFor(() => {
                expect(screen.getByText('Shopify')).toBeInTheDocument()
            })

            expect(screen.queryByRole('separator')).not.toBeInTheDocument()
        })

        it('disables Add button while loading', () => {
            const listWidgetsMock = mockListWidgetsHandler(async () => {
                await new Promise(() => {})
                return HttpResponse.json(widgetListResponse)
            })
            server.use(listWidgetsMock.handler)

            render(<CustomActionsSection integrationName="Shopify" />)

            expect(screen.getByRole('button', { name: /add/i })).toBeDisabled()
        })
    })

    describe('Add menu interactions', () => {
        it('opens "Add button" dialog', async () => {
            const { user } = renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Button')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /add/i }))
            await user.click(
                screen.getByRole('menuitem', { name: /add button/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('dialog', {
                        name: /configure http action/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('opens "Add link" dialog', async () => {
            const { user } = renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Button')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /add/i }))
            await user.click(
                screen.getByRole('menuitem', { name: /add link/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('dialog', { name: /add link/i }),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Edit interactions', () => {
        it('opens edit button dialog', async () => {
            const { user } = renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Button')).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: /edit test button/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('dialog', {
                        name: /edit http action/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('opens edit link dialog', async () => {
            const { user } = renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Link')).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: /edit test link/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('dialog', { name: /edit link/i }),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Submit interactions', () => {
        it('adds a new link via the dialog', async () => {
            const updateWidgetMock = mockUpdateWidgetHandler()
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json(widgetListResponse),
            )
            server.use(listWidgetsMock.handler, updateWidgetMock.handler)

            const { user } = render(
                <CustomActionsSection integrationName="Shopify" />,
            )

            await waitFor(() => {
                expect(screen.getByText('Test Link')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /add/i }))
            await user.click(
                screen.getByRole('menuitem', { name: /add link/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('dialog', { name: /add link/i }),
                ).toBeInTheDocument()
            })

            const dialog = screen.getByRole('dialog', { name: /add link/i })
            await user.type(within(dialog).getByLabelText(/title/i), 'New Link')
            await user.type(
                within(dialog).getByLabelText(/url/i),
                'https://new-link.com',
            )

            const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

            await user.click(
                within(dialog).getByRole('button', { name: /save/i }),
            )

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                const customerWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'customer',
                )
                expect(customerWidget.meta.custom.links).toHaveLength(2)
                expect(customerWidget.meta.custom.links[1].label).toBe(
                    'New Link',
                )
                expect(customerWidget.meta.custom.links[1].url).toBe(
                    'https://new-link.com',
                )
            })
        })

        it('edits an existing link via the dialog', async () => {
            const updateWidgetMock = mockUpdateWidgetHandler()
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json(widgetListResponse),
            )
            server.use(listWidgetsMock.handler, updateWidgetMock.handler)

            const { user } = render(
                <CustomActionsSection integrationName="Shopify" />,
            )

            await waitFor(() => {
                expect(screen.getByText('Test Link')).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: /edit test link/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('dialog', { name: /edit link/i }),
                ).toBeInTheDocument()
            })

            const dialog = screen.getByRole('dialog', { name: /edit link/i })
            const titleInput = within(dialog).getByLabelText(/title/i)
            const urlInput = within(dialog).getByLabelText(/url/i)

            await user.clear(titleInput)
            await user.type(titleInput, 'Updated Link')
            await user.clear(urlInput)
            await user.type(urlInput, 'https://updated-link.com')

            const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

            await user.click(
                within(dialog).getByRole('button', { name: /save/i }),
            )

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                const customerWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'customer',
                )
                expect(customerWidget.meta.custom.links).toHaveLength(1)
                expect(customerWidget.meta.custom.links[0].label).toBe(
                    'Updated Link',
                )
                expect(customerWidget.meta.custom.links[0].url).toBe(
                    'https://updated-link.com',
                )
            })
        })

        it('adds a new button via the dialog', async () => {
            const updateWidgetMock = mockUpdateWidgetHandler()
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json(widgetListResponse),
            )
            server.use(listWidgetsMock.handler, updateWidgetMock.handler)

            const { user } = render(
                <CustomActionsSection integrationName="Shopify" />,
            )

            await waitFor(() => {
                expect(screen.getByText('Test Button')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /add/i }))
            await user.click(
                screen.getByRole('menuitem', { name: /add button/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('dialog', {
                        name: /configure http action/i,
                    }),
                ).toBeInTheDocument()
            })

            const dialog = screen.getByRole('dialog', {
                name: /configure http action/i,
            })
            await user.type(
                within(dialog).getByLabelText(/button title/i),
                'New Button',
            )
            await user.type(
                within(dialog).getByLabelText(/url/i),
                'https://api.new-button.com',
            )

            const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

            await user.click(
                within(dialog).getByRole('button', { name: /save/i }),
            )

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                const customerWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'customer',
                )
                expect(customerWidget.meta.custom.buttons).toHaveLength(2)
                expect(customerWidget.meta.custom.buttons[1].label).toBe(
                    'New Button',
                )
                expect(customerWidget.meta.custom.buttons[1].action.url).toBe(
                    'https://api.new-button.com',
                )
            })
        })

        it('edits an existing button via the dialog', async () => {
            const updateWidgetMock = mockUpdateWidgetHandler()
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json(widgetListResponse),
            )
            server.use(listWidgetsMock.handler, updateWidgetMock.handler)

            const { user } = render(
                <CustomActionsSection integrationName="Shopify" />,
            )

            await waitFor(() => {
                expect(screen.getByText('Test Button')).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: /edit test button/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('dialog', {
                        name: /edit http action/i,
                    }),
                ).toBeInTheDocument()
            })

            const dialog = screen.getByRole('dialog', {
                name: /edit http action/i,
            })
            const titleInput = within(dialog).getByLabelText(/button title/i)
            const urlInput = within(dialog).getByLabelText(/url/i)

            await user.clear(titleInput)
            await user.type(titleInput, 'Updated Button')
            await user.clear(urlInput)
            await user.type(urlInput, 'https://api.updated-button.com')

            const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

            await user.click(
                within(dialog).getByRole('button', { name: /save/i }),
            )

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                const customerWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'customer',
                )
                expect(customerWidget.meta.custom.buttons).toHaveLength(1)
                expect(customerWidget.meta.custom.buttons[0].label).toBe(
                    'Updated Button',
                )
                expect(customerWidget.meta.custom.buttons[0].action.url).toBe(
                    'https://api.updated-button.com',
                )
            })
        })
    })

    describe('Delete interactions', () => {
        it('deletes a button', async () => {
            const updateWidgetMock = mockUpdateWidgetHandler()
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json(widgetListResponse),
            )
            server.use(listWidgetsMock.handler, updateWidgetMock.handler)

            const { user } = render(
                <CustomActionsSection integrationName="Shopify" />,
            )

            await waitFor(() => {
                expect(screen.getByText('Test Button')).toBeInTheDocument()
            })

            const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

            await user.click(
                screen.getByRole('button', {
                    name: /delete test button/i,
                }),
            )

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                const customerWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'customer',
                )
                expect(customerWidget.meta.custom.buttons).toHaveLength(0)
            })
        })

        it('deletes a link', async () => {
            const updateWidgetMock = mockUpdateWidgetHandler()
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json(widgetListResponse),
            )
            server.use(listWidgetsMock.handler, updateWidgetMock.handler)

            const { user } = render(
                <CustomActionsSection integrationName="Shopify" />,
            )

            await waitFor(() => {
                expect(screen.getByText('Test Link')).toBeInTheDocument()
            })

            const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

            await user.click(
                screen.getByRole('button', {
                    name: /delete test link/i,
                }),
            )

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                const customerWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'customer',
                )
                expect(customerWidget.meta.custom.links).toHaveLength(0)
            })
        })
    })
})
