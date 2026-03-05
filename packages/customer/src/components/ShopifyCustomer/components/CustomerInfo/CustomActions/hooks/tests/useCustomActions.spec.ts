import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateWidgetHandler,
    mockListWidgetsHandler,
    mockUpdateWidgetHandler,
} from '@gorgias/helpdesk-mocks'
import type { Widget } from '@gorgias/helpdesk-types'

import {
    renderHook,
    testAppQueryClient,
} from '../../../../../../../tests/render.utils'
import { useCustomActions } from '../useCustomActions'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
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

const emptyListResponse = {
    data: [] as Widget[],
    meta: { next_cursor: null, prev_cursor: null },
    object: 'list' as unknown,
    uri: '/api/widgets',
}

describe('useCustomActions', () => {
    it('returns links and buttons from widget data', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        server.use(listWidgetsMock.handler)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.links).toHaveLength(1)
        })

        expect(result.current.links[0].label).toBe('Test Link')
        expect(result.current.buttons).toHaveLength(1)
        expect(result.current.buttons[0].label).toBe('Test Button')
    })

    it('returns empty arrays when no widget exists', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(emptyListResponse),
        )
        server.use(listWidgetsMock.handler)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.links).toEqual([])
        expect(result.current.buttons).toEqual([])
    })

    it('addLink adds a new link', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.links).toHaveLength(1)
        })

        act(() => {
            result.current.addLink({
                label: 'New Link',
                url: 'https://new.com',
            })
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            expect(customerWidget.meta.custom.links).toHaveLength(2)
            expect(customerWidget.meta.custom.links[1].label).toBe('New Link')
        })
    })

    it('removeLink removes a link by index', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.links).toHaveLength(1)
        })

        act(() => {
            result.current.removeLink(0)
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            expect(customerWidget.meta.custom.links).toHaveLength(0)
        })
    })

    it('addButton adds a new button', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.buttons).toHaveLength(1)
        })

        const newButton = {
            label: 'New Button',
            action: {
                method: 'POST' as const,
                url: 'https://api.new.com',
                headers: [],
                params: [],
                body: {
                    contentType: 'application/json' as const,
                    'application/json': {},
                    'application/x-www-form-urlencoded': [],
                },
            },
        }

        act(() => {
            result.current.addButton(newButton)
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            expect(customerWidget.meta.custom.buttons).toHaveLength(2)
            expect(customerWidget.meta.custom.buttons[1].label).toBe(
                'New Button',
            )
        })
    })

    it('editLink replaces a link at index', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.links).toHaveLength(1)
        })

        act(() => {
            result.current.editLink(0, {
                label: 'Updated Link',
                url: 'https://updated.com',
            })
        })

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
                'https://updated.com',
            )
        })
    })

    it('editButton replaces a button at index', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.buttons).toHaveLength(1)
        })

        const updatedButton = {
            label: 'Updated Button',
            action: {
                method: 'PUT' as const,
                url: 'https://api.updated.com',
                headers: [],
                params: [],
                body: {
                    contentType: 'application/json' as const,
                    'application/json': {},
                    'application/x-www-form-urlencoded': [],
                },
            },
        }

        act(() => {
            result.current.editButton(0, updatedButton)
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            expect(customerWidget.meta.custom.buttons).toHaveLength(1)
            expect(customerWidget.meta.custom.buttons[0].label).toBe(
                'Updated Button',
            )
        })
    })

    it('removeButton removes a button by index', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.buttons).toHaveLength(1)
        })

        act(() => {
            result.current.removeButton(0)
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            expect(customerWidget.meta.custom.buttons).toHaveLength(0)
        })
    })

    it('rolls back optimistic update on error', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler(async () =>
            HttpResponse.json({ error: 'Server error' } as unknown as Widget, {
                status: 500,
            }),
        )
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.links).toHaveLength(1)
        })

        await act(async () => {
            try {
                await result.current.addLink({
                    label: 'Will Fail',
                    url: 'https://fail.com',
                })
            } catch {
                // expected
            }
        })

        await waitFor(() => {
            expect(result.current.links).toHaveLength(1)
            expect(result.current.links[0].label).toBe('Test Link')
        })
    })

    it('creates widget when none exists', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(emptyListResponse),
        )
        const createWidgetMock = mockCreateWidgetHandler()
        server.use(listWidgetsMock.handler, createWidgetMock.handler)

        const waitForCreateRequest = createWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useCustomActions())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        act(() => {
            result.current.addLink({
                label: 'First Link',
                url: 'https://first.com',
            })
        })

        await waitForCreateRequest(async (request) => {
            const body = await request.json()
            expect(body.type).toBe('shopify')
            expect(body.context).toBe('ticket')
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            expect(customerWidget.meta.custom.links[0].label).toBe('First Link')
        })
    })
})
