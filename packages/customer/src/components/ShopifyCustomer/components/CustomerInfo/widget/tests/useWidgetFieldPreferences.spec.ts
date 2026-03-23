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
} from '../../../../../../tests/render.utils'
import { useWidgetFieldPreferences } from '../useWidgetFieldPreferences'

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
                widgets: [
                    { path: 'total_spent', type: 'text', title: 'Total spent' },
                    { path: 'email', type: 'email', title: 'Email' },
                ],
                meta: {
                    custom: {
                        fieldPreferences: [
                            { id: 'totalSpent', visible: true },
                            { id: 'email', visible: true },
                            { id: 'orders', visible: false },
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

describe('useWidgetFieldPreferences', () => {
    it('loads preferences from an existing widget', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        server.use(listWidgetsMock.handler)

        const { result } = renderHook(() => useWidgetFieldPreferences())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        const visibleFields = result.current.preferences.fields.filter(
            (f) => f.visible,
        )
        expect(visibleFields).toEqual(
            expect.arrayContaining([
                { id: 'totalSpent', visible: true },
                { id: 'email', visible: true },
            ]),
        )
    })

    it('returns default preferences when no widget exists', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(emptyListResponse),
        )
        server.use(listWidgetsMock.handler)

        const { result } = renderHook(() => useWidgetFieldPreferences())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.preferences.fields.every((f) => !f.visible)).toBe(
            true,
        )
    })

    it('saves preferences by updating an existing widget', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useWidgetFieldPreferences())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.savePreferences({
                fields: [
                    { id: 'totalSpent', visible: true },
                    { id: 'email', visible: false },
                    { id: 'orders', visible: true },
                ],
            })
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            expect(body.template.widgets[0].path).toBe('customer')
            expect(
                body.template.widgets[0].meta.custom.fieldPreferences,
            ).toEqual([
                { id: 'totalSpent', visible: true },
                { id: 'email', visible: false },
                { id: 'orders', visible: true },
            ])
        })
    })

    it('creates a new widget when none exists', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(emptyListResponse),
        )
        const createWidgetMock = mockCreateWidgetHandler()
        server.use(listWidgetsMock.handler, createWidgetMock.handler)

        const waitForCreateRequest = createWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useWidgetFieldPreferences())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.savePreferences({
                fields: [
                    { id: 'totalSpent', visible: true },
                    { id: 'email', visible: false },
                ],
            })
        })

        await waitForCreateRequest(async (request) => {
            const body = await request.json()
            expect(body.type).toBe('shopify')
            expect(body.context).toBe('ticket')
            expect(body.template.widgets[0].path).toBe('customer')
            expect(
                body.template.widgets[0].meta.custom.fieldPreferences,
            ).toEqual([
                { id: 'totalSpent', visible: true },
                { id: 'email', visible: false },
            ])
        })
    })

    it('includes section widgets in save payload', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler()
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

        const { result } = renderHook(() => useWidgetFieldPreferences())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.savePreferences({
                fields: [{ id: 'totalSpent', visible: true }],
                sections: {
                    customer: {
                        fields: [{ id: 'totalSpent', visible: true }],
                    },
                    defaultAddress: {
                        fields: [
                            { id: 'address1', visible: true },
                            { id: 'city', visible: true },
                        ],
                    },
                    emailMarketingConsent: {
                        fields: [{ id: 'state', visible: true }],
                    },
                    addresses: {
                        fields: [{ id: 'address1', visible: true }],
                    },
                },
            })
        })

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            const customerWidgets = body.template.widgets[0].widgets

            const defaultAddressWidget = customerWidgets.find(
                (w: { path: string }) => w.path === 'default_address',
            )
            expect(defaultAddressWidget).toBeDefined()
            expect(defaultAddressWidget.type).toBe('card')
            expect(defaultAddressWidget.widgets).toHaveLength(2)

            const emailConsentWidget = customerWidgets.find(
                (w: { path: string }) => w.path === 'email_marketing_consent',
            )
            expect(emailConsentWidget).toBeDefined()
            expect(emailConsentWidget.type).toBe('card')

            const addressesWidget = customerWidgets.find(
                (w: { path: string }) => w.path === 'addresses',
            )
            expect(addressesWidget).toBeDefined()
            expect(addressesWidget.type).toBe('list')
            expect(addressesWidget.widgets[0].type).toBe('card')
        })
    })

    it('rolls back optimistic update on error', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json(widgetListResponse),
        )
        const updateWidgetMock = mockUpdateWidgetHandler(
            async () => new HttpResponse(null, { status: 500 }),
        )
        server.use(listWidgetsMock.handler, updateWidgetMock.handler)

        const { result } = renderHook(() => useWidgetFieldPreferences())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        const originalPreferences = result.current.preferences

        await act(async () => {
            try {
                await result.current.savePreferences({
                    fields: [
                        { id: 'totalSpent', visible: false },
                        { id: 'email', visible: false },
                    ],
                })
            } catch {
                // Expected
            }
        })

        await waitFor(() => {
            expect(result.current.preferences.fields).toEqual(
                originalPreferences.fields,
            )
        })
    })
})
