import { renderHook } from '@repo/testing/vitest'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockCreateWidgetHandler,
    mockListWidgetsHandler,
    mockUpdateWidgetHandler,
} from '@gorgias/helpdesk-mocks'
import type { Widget } from '@gorgias/helpdesk-types'

import { server } from '../../../../../../../tests/server'
import type { ButtonConfig, LinkConfig } from '../../utils/customActionTypes'
import type { WidgetPath } from '../../utils/customActionWidgetUtils'
import { useCustomActions } from '../useCustomActions'
import { useSaveCustomActions } from '../useSaveCustomActions'

const sampleLink: LinkConfig = {
    label: 'Test Link',
    url: 'https://example.com',
}

const sampleButton: ButtonConfig = {
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
}

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
                        links: [sampleLink],
                        buttons: [sampleButton],
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

const newLink = { label: 'New Link', url: 'https://new.com' }

function renderSaveAndRead(widgetPath: WidgetPath = 'customer') {
    return renderHook(() => ({
        reader: useCustomActions({ widgetPath }),
        save: useSaveCustomActions().save,
    }))
}

describe('useSaveCustomActions', () => {
    it('saves a customer-only update via updateWidget', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderSaveAndRead()

        await waitFor(() => {
            expect(result.current.reader.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.save({
                customer: {
                    links: [sampleLink, newLink],
                    buttons: [sampleButton],
                },
            })
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            expect(customerWidget.meta.custom.links).toHaveLength(2)
            expect(customerWidget.meta.custom.links[1].label).toBe('New Link')
            const orderWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'order',
            )
            expect(orderWidget).toBeUndefined()
        })
    })

    it('saves an order-only update without touching the customer widget', async () => {
        const widget = {
            ...shopifyWidget,
            template: {
                ...shopifyWidget.template,
                widgets: [
                    ...shopifyWidget.template.widgets,
                    {
                        path: 'order',
                        type: 'order',
                        widgets: [],
                        meta: {
                            custom: {
                                links: [
                                    {
                                        label: 'Existing Order Link',
                                        url: 'https://order.example.com',
                                    },
                                ],
                                buttons: [],
                            },
                        },
                    },
                ],
            },
        }
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json({
                data: [widget],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list' as unknown,
                uri: '/api/widgets',
            }),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderSaveAndRead('order')

        await waitFor(() => {
            expect(result.current.reader.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.save({
                order: {
                    links: [
                        {
                            label: 'Existing Order Link',
                            url: 'https://order.example.com',
                        },
                        {
                            label: 'New Order Link',
                            url: 'https://new-order.com',
                        },
                    ],
                    buttons: [],
                },
            })
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const orderWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'order',
            )
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            expect(orderWidget.meta.custom.links).toHaveLength(2)
            expect(orderWidget.meta.custom.links[1].label).toBe(
                'New Order Link',
            )
            expect(customerWidget.meta.custom.links).toHaveLength(1)
            expect(customerWidget.meta.custom.links[0].label).toBe('Test Link')
        })
    })

    it('saves customer and order updates in a single updateWidget request', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        let updateCallCount = 0
        const updateWidgetMock = mockUpdateWidgetHandler(async ({ data }) => {
            updateCallCount += 1
            return HttpResponse.json(data)
        })
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderSaveAndRead()

        await waitFor(() => {
            expect(result.current.reader.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.save({
                customer: {
                    links: [sampleLink, newLink],
                    buttons: [sampleButton],
                },
                order: {
                    links: [
                        {
                            label: 'New Order Link',
                            url: 'https://new-order.com',
                        },
                    ],
                    buttons: [],
                },
            })
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            const orderWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'order',
            )
            expect(customerWidget.meta.custom.links).toHaveLength(2)
            expect(orderWidget.meta.custom.links).toHaveLength(1)
            expect(orderWidget.meta.custom.links[0].label).toBe(
                'New Order Link',
            )
        })

        expect(updateCallCount).toBe(1)
    })

    it('creates a single widget when none exists and both customer + order are saved together', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(emptyListResponse),
        )
        let createCallCount = 0
        const createWidgetMock = mockCreateWidgetHandler(async ({ data }) => {
            createCallCount += 1
            return HttpResponse.json(data as unknown as Widget)
        })
        server.use(listWidgetsMock.handler, createWidgetMock.handler)

        const waitForCreateRequest = createWidgetMock.waitForRequest(server)

        const { result } = renderSaveAndRead()

        await waitFor(() => {
            expect(result.current.reader.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.save({
                customer: {
                    links: [{ label: 'C-link', url: 'https://c.com' }],
                    buttons: [],
                },
                order: {
                    links: [{ label: 'O-link', url: 'https://o.com' }],
                    buttons: [],
                },
            })
        })

        await waitForCreateRequest(async (request) => {
            const body = await request.json()
            expect(body.type).toBe('shopify')
            expect(body.context).toBe('ticket')
            const customerWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'customer',
            )
            const orderWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'order',
            )
            expect(customerWidget.meta.custom.links[0].label).toBe('C-link')
            expect(orderWidget.meta.custom.links[0].label).toBe('O-link')
        })

        expect(createCallCount).toBe(1)
    })

    it('creates an order-scoped widget when none exists', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(emptyListResponse),
        )
        const createWidgetMock = mockCreateWidgetHandler()
        server.use(listWidgetsMock.handler, createWidgetMock.handler)

        const waitForCreateRequest = createWidgetMock.waitForRequest(server)

        const { result } = renderSaveAndRead('order')

        await waitFor(() => {
            expect(result.current.reader.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.save({
                order: {
                    links: [
                        { label: 'First Order Link', url: 'https://first.com' },
                    ],
                    buttons: [],
                },
            })
        })

        await waitForCreateRequest(async (request) => {
            const body = await request.json()
            const orderWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'order',
            )
            expect(orderWidget.meta.custom.links[0].label).toBe(
                'First Order Link',
            )
            expect(
                body.template.widgets.find(
                    (w: { path: string }) => w.path === 'customer',
                ),
            ).toBeUndefined()
        })
    })

    it('preserves orderSectionPreferences on the order widget when saving', async () => {
        const widget = {
            id: 1,
            type: 'shopify' as const,
            context: 'ticket' as const,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: 'order',
                        type: 'order',
                        widgets: [],
                        meta: {
                            custom: {
                                orderSectionPreferences: {
                                    details: {
                                        fields: [{ id: 'id', visible: true }],
                                    },
                                },
                                links: [],
                                buttons: [],
                            },
                        },
                    },
                ],
            },
        }
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json({
                data: [widget],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list' as unknown,
                uri: '/api/widgets',
            }),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderSaveAndRead('order')

        await waitFor(() => {
            expect(result.current.reader.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.save({
                order: {
                    links: [
                        {
                            label: 'Tracking',
                            url: 'https://example.com/track/{{order.id}}',
                        },
                    ],
                    buttons: [],
                },
            })
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const orderWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'order',
            )
            expect(orderWidget.meta.custom.orderSectionPreferences).toEqual({
                details: { fields: [{ id: 'id', visible: true }] },
            })
            expect(orderWidget.meta.custom.links[0].label).toBe('Tracking')
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

        const { result } = renderSaveAndRead()

        await waitFor(() => {
            expect(result.current.reader.links).toHaveLength(1)
        })

        await act(async () => {
            try {
                await result.current.save({
                    customer: {
                        links: [
                            sampleLink,
                            { label: 'Will Fail', url: 'https://fail.com' },
                        ],
                        buttons: [sampleButton],
                    },
                })
            } catch {
                // expected
            }
        })

        await waitFor(() => {
            expect(result.current.reader.links).toHaveLength(1)
            expect(result.current.reader.links[0].label).toBe('Test Link')
        })
    })

    it('migrates legacy order entries into a new path: "order" widget when passed in the save payload', async () => {
        const legacyLink = {
            label: 'legacy order widget link',
            url: 'https://www.google.com',
        }
        const legacyWidget = {
            id: 1,
            type: 'shopify' as const,
            context: 'ticket' as const,
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: 'orders',
                        type: 'list',
                        meta: { limit: 3, orderBy: '-created_at' },
                        widgets: [
                            {
                                type: 'card',
                                title: 'Order {{name}}',
                                meta: {
                                    custom: {
                                        links: [legacyLink],
                                        buttons: [],
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        }
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json({
                data: [legacyWidget],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list' as unknown,
                uri: '/api/widgets',
            }),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderSaveAndRead('order')

        await waitFor(() => {
            expect(result.current.reader.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.save({
                order: {
                    links: [
                        legacyLink,
                        { label: 'newly added', url: 'https://new.com' },
                    ],
                    buttons: [],
                },
            })
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const newOrderWidget = body.template.widgets.find(
                (w: { path: string }) => w.path === 'order',
            )
            expect(newOrderWidget.meta.custom.links).toEqual([
                legacyLink,
                { label: 'newly added', url: 'https://new.com' },
            ])
            const legacyOrdersList = body.template.widgets.find(
                (w: { path: string }) => w.path === 'orders',
            )
            expect(legacyOrdersList).toEqual(legacyWidget.template.widgets[0])
        })
    })
})
