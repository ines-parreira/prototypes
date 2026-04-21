import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import {
    mockCreateAccountSettingHandler,
    mockListAccountSettingsHandler,
    mockUpdateAccountSettingHandler,
} from '@gorgias/helpdesk-mocks'
import { useListAccountSettings } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../tests/render.utils'
import { useUpdateDefaultViewsVisibility } from '../useUpdateDefaultViewsVisibility'

const server = setupServer()

const listState: {
    current: Array<{
        id?: number
        type: string
        data: Record<string, unknown>
    }>
} = {
    current: [],
}
const requestCount = {
    list: 0,
}

const mockListAccountSettings = mockListAccountSettingsHandler(async () => {
    requestCount.list += 1

    return HttpResponse.json({
        data: listState.current,
        meta: {
            next_cursor: null,
            prev_cursor: null,
            total_resources: listState.current.length,
        },
        object: 'list',
        uri: '/api/account-settings',
    } as any)
})

const mockCreateAccountSetting = mockCreateAccountSettingHandler(async () =>
    HttpResponse.json({
        id: 42,
        type: 'views-visibility',
        data: { hidden_views: [1, 2] },
    }),
)

const mockUpdateAccountSetting = mockUpdateAccountSettingHandler(async () =>
    HttpResponse.json({
        id: 42,
        type: 'views-visibility',
        data: { hidden_views: [4] },
    }),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    requestCount.list = 0
    listState.current = [
        {
            id: 1,
            type: 'other-setting',
            data: {},
        },
    ]
    server.use(
        mockListAccountSettings.handler,
        mockCreateAccountSetting.handler,
        mockUpdateAccountSetting.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

function useHooks() {
    const settings = useListAccountSettings({ type: 'views-visibility' })
    const updateVisibility = useUpdateDefaultViewsVisibility()
    return { settings, updateVisibility }
}

type UseHooksResult = ReturnType<typeof useHooks>

function getSettings(result: { current: UseHooksResult }) {
    return result.current.settings.data?.data.data ?? []
}

describe('useUpdateDefaultViewsVisibility', () => {
    it('calls updateAccountSetting when id is provided', async () => {
        const { result } = renderHook(() => useHooks())
        const waitForRequest = mockUpdateAccountSetting.waitForRequest(server)

        result.current.updateVisibility({
            id: 42,
            data: { type: 'views-visibility', data: { hidden_views: [1] } },
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body).toEqual({
                type: 'views-visibility',
                data: { hidden_views: [1] },
            })
        })
    })

    it('calls createAccountSetting when id is undefined', async () => {
        const { result } = renderHook(() => useHooks())
        const waitForRequest = mockCreateAccountSetting.waitForRequest(server)

        result.current.updateVisibility({
            id: undefined,
            data: { type: 'views-visibility', data: { hidden_views: [3, 5] } },
        })

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body).toEqual({
                type: 'views-visibility',
                data: { hidden_views: [3, 5] },
            })
        })
    })

    it('optimistically adds the new views-visibility setting and keeps existing entries', async () => {
        let resolveRequest: (() => void) | undefined
        const pendingRequest = new Promise<void>((resolve) => {
            resolveRequest = resolve
        })

        server.use(
            mockCreateAccountSettingHandler(async () => {
                await pendingRequest
                listState.current = [
                    {
                        id: 1,
                        type: 'other-setting',
                        data: {},
                    },
                    {
                        id: 42,
                        type: 'views-visibility',
                        data: { hidden_views: [1, 2] },
                    },
                ]

                return HttpResponse.json({
                    id: 42,
                    type: 'views-visibility',
                    data: { hidden_views: [1, 2] },
                })
            }).handler,
        )

        const { result } = renderHook(() => useHooks())

        await waitFor(() => {
            expect(getSettings(result)).toEqual(listState.current)
        })

        result.current.updateVisibility({
            id: undefined,
            data: { type: 'views-visibility', data: { hidden_views: [1, 2] } },
        })

        await waitFor(() => {
            expect(getSettings(result)).toEqual([
                {
                    id: 1,
                    type: 'other-setting',
                    data: {},
                },
                {
                    type: 'views-visibility',
                    data: { hidden_views: [1, 2] },
                },
            ])
        })

        resolveRequest?.()

        await waitFor(() => {
            expect(getSettings(result)).toEqual([
                {
                    id: 1,
                    type: 'other-setting',
                    data: {},
                },
                {
                    id: 42,
                    type: 'views-visibility',
                    data: { hidden_views: [1, 2] },
                },
            ])
        })
    })

    it('rolls back the cache and shows an error toast when create fails', async () => {
        const toastErrorSpy = vi
            .spyOn(toast, 'error')
            .mockImplementation(() => '' as any)
        let resolveRequest: (() => void) | undefined
        const pendingRequest = new Promise<void>((resolve) => {
            resolveRequest = resolve
        })

        server.use(
            mockCreateAccountSettingHandler(async () => {
                await pendingRequest
                return new HttpResponse(null, { status: 500 })
            }).handler,
        )

        const { result } = renderHook(() => useHooks())

        await waitFor(() => {
            expect(getSettings(result)).toEqual(listState.current)
        })

        result.current.updateVisibility({
            id: undefined,
            data: { type: 'views-visibility', data: { hidden_views: [7] } },
        })

        await waitFor(() => {
            expect(getSettings(result)).toContainEqual({
                type: 'views-visibility',
                data: { hidden_views: [7] },
            })
        })

        resolveRequest?.()

        await waitFor(() => {
            expect(getSettings(result)).toEqual(listState.current)
        })

        expect(toastErrorSpy).toHaveBeenCalledWith(
            'Failed to update views visibility',
        )
    })

    it('optimistically updates an existing setting and refetches the settled server data', async () => {
        listState.current = [
            {
                id: 42,
                type: 'views-visibility',
                data: { hidden_views: [1] },
            },
        ]
        let resolveRequest: (() => void) | undefined
        const pendingRequest = new Promise<void>((resolve) => {
            resolveRequest = resolve
        })

        server.use(
            mockUpdateAccountSettingHandler(async () => {
                await pendingRequest
                listState.current = [
                    {
                        id: 42,
                        type: 'views-visibility',
                        data: { hidden_views: [4] },
                    },
                ]

                return HttpResponse.json({
                    id: 42,
                    type: 'views-visibility',
                    data: { hidden_views: [4] },
                })
            }).handler,
        )

        const { result } = renderHook(() => useHooks())

        await waitFor(() => {
            expect(getSettings(result)).toEqual([
                {
                    id: 42,
                    type: 'views-visibility',
                    data: { hidden_views: [1] },
                },
            ])
        })

        result.current.updateVisibility({
            id: 42,
            data: { type: 'views-visibility', data: { hidden_views: [2, 3] } },
        })

        await waitFor(() => {
            expect(getSettings(result)).toEqual([
                {
                    id: 42,
                    type: 'views-visibility',
                    data: { hidden_views: [2, 3] },
                },
            ])
        })

        resolveRequest?.()

        await waitFor(() => {
            expect(getSettings(result)).toEqual([
                {
                    id: 42,
                    type: 'views-visibility',
                    data: { hidden_views: [4] },
                },
            ])
        })

        expect(requestCount.list).toBeGreaterThan(1)
    })
})
