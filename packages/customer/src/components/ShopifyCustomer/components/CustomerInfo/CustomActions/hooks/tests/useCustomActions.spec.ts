import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockListWidgetsHandler } from '@gorgias/helpdesk-mocks'
import type { Widget } from '@gorgias/helpdesk-types'

import { server } from '../../../../../../../tests/server'
import { useCustomActions } from '../useCustomActions'

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
})

describe('useCustomActions with widgetPath: "order"', () => {
    const orderWidget = {
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
                                    label: 'Customer Link',
                                    url: 'https://customer.example.com',
                                },
                            ],
                            buttons: [],
                        },
                    },
                },
                {
                    path: 'order',
                    type: 'order',
                    widgets: [],
                    meta: {
                        custom: {
                            links: [
                                {
                                    label: 'Order Link',
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

    it('returns links and buttons from the order widget', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json({
                data: [orderWidget],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list' as unknown,
                uri: '/api/widgets',
            }),
        )
        server.use(listWidgetsMock.handler)

        const { result } = renderHook(() =>
            useCustomActions({ widgetPath: 'order' }),
        )

        await waitFor(() => {
            expect(result.current.links).toHaveLength(1)
        })

        expect(result.current.links[0].label).toBe('Order Link')
    })
})

describe('useCustomActions widgetPath: "order" — legacy fallback', () => {
    const legacyOrderLink = {
        label: 'legacy order widget link',
        url: 'https://www.google.com',
    }

    const legacyOnlyWidget = {
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
                                    links: [legacyOrderLink],
                                    buttons: [],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    }

    const legacyOnlyResponse = {
        data: [legacyOnlyWidget],
        meta: { next_cursor: null, prev_cursor: null },
        object: 'list' as unknown,
        uri: '/api/widgets',
    }

    it('reads legacy order data when no path: "order" widget exists', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(legacyOnlyResponse),
        )
        server.use(listWidgetsMock.handler)

        const { result } = renderHook(() =>
            useCustomActions({ widgetPath: 'order' }),
        )

        await waitFor(() => {
            expect(result.current.links).toHaveLength(1)
        })

        expect(result.current.links[0]).toEqual(legacyOrderLink)
    })

    it('an empty path: "order" widget shadows legacy data', async () => {
        const widgetWithEmptyNew = {
            ...legacyOnlyWidget,
            template: {
                ...legacyOnlyWidget.template,
                widgets: [
                    ...legacyOnlyWidget.template.widgets,
                    {
                        path: 'order',
                        type: 'order',
                        widgets: [],
                        meta: { custom: { links: [], buttons: [] } },
                    },
                ],
            },
        }
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json({
                data: [widgetWithEmptyNew],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list' as unknown,
                uri: '/api/widgets',
            }),
        )
        server.use(listWidgetsMock.handler)

        const { result } = renderHook(() =>
            useCustomActions({ widgetPath: 'order' }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.links).toEqual([])
        expect(result.current.buttons).toEqual([])
    })

    it('a populated path: "order" widget shadows legacy data', async () => {
        const newOrderLink = {
            label: 'new order link',
            url: 'https://new.com',
        }
        const widgetWithNew = {
            ...legacyOnlyWidget,
            template: {
                ...legacyOnlyWidget.template,
                widgets: [
                    ...legacyOnlyWidget.template.widgets,
                    {
                        path: 'order',
                        type: 'order',
                        widgets: [],
                        meta: {
                            custom: { links: [newOrderLink], buttons: [] },
                        },
                    },
                ],
            },
        }
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json({
                data: [widgetWithNew],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list' as unknown,
                uri: '/api/widgets',
            }),
        )
        server.use(listWidgetsMock.handler)

        const { result } = renderHook(() =>
            useCustomActions({ widgetPath: 'order' }),
        )

        await waitFor(() => {
            expect(result.current.links).toHaveLength(1)
        })

        expect(result.current.links[0]).toEqual(newOrderLink)
    })
})
