import {
    useDefaultViewsSourceSdkFlagWithLoading,
    useHelpdeskV2WayfindingMS1Flag,
} from '@repo/feature-flags'
import {
    useDefaultViews as useSdkDefaultViews,
    useDefaultViewsError as useSdkDefaultViewsError,
    useDefaultViewsLoading as useSdkDefaultViewsLoading,
} from '@repo/views'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListAccountSettingsHandler,
    mockListAccountSettingsResponse,
} from '@gorgias/helpdesk-mocks'
import type { View } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import type {
    getOrderedSystemViews as getOrderedSystemViewsType,
    useDefaultViews as useDefaultViewsType,
} from '../useDefaultViews'

vi.mock('@repo/feature-flags', () => ({
    useDefaultViewsSourceSdkFlagWithLoading: vi.fn(),
    useHelpdeskV2WayfindingMS1Flag: vi.fn(),
}))
vi.mock('@repo/views', () => ({
    useDefaultViews: vi.fn(),
    useDefaultViewsError: vi.fn(),
    useDefaultViewsLoading: vi.fn(),
}))

const mockUseHelpdeskV2WayfindingMS1Flag = vi.mocked(
    useHelpdeskV2WayfindingMS1Flag,
)
const mockUseDefaultViewsSourceSdkFlagWithLoading = vi.mocked(
    useDefaultViewsSourceSdkFlagWithLoading,
)
const mockUseSdkDefaultViews = vi.mocked(useSdkDefaultViews)
const mockUseSdkDefaultViewsLoading = vi.mocked(useSdkDefaultViewsLoading)
const mockUseSdkDefaultViewsError = vi.mocked(useSdkDefaultViewsError)
let getOrderedSystemViews: typeof getOrderedSystemViewsType
let useDefaultViews: typeof useDefaultViewsType
let visibilitySetting:
    | {
          id: number
          type: string
          data: { hidden_views: number[] }
      }
    | undefined
let accountSettingsRequestCount = 0

const allSystemViews: View[] = [
    { id: 1, name: 'Inbox', category: 'system', uri: '/api/views/1' },
    { id: 2, name: 'Unassigned', category: 'system', uri: '/api/views/2' },
    { id: 3, name: 'All', category: 'system', uri: '/api/views/3' },
    { id: 4, name: 'Snoozed', category: 'system', uri: '/api/views/4' },
    { id: 5, name: 'Closed', category: 'system', uri: '/api/views/5' },
    { id: 6, name: 'Trash', category: 'system', uri: '/api/views/6' },
    { id: 7, name: 'Spam', category: 'system', uri: '/api/views/7' },
]

beforeAll(async () => {
    ;(
        window as typeof window & {
            GORGIAS_STATE?: {
                currentAccount: { domain: string; id: number; user_id: number }
                views?: { items?: View[] }
            }
        }
    ).GORGIAS_STATE = {
        currentAccount: { domain: 'example', id: 1, user_id: 1 },
        views: {
            items: allSystemViews,
        },
    }

    ;({ getOrderedSystemViews, useDefaultViews } =
        await import('../useDefaultViews'))
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

function mockAccountSettingsHandler() {
    return mockListAccountSettingsHandler(async ({ request }) => {
        accountSettingsRequestCount += 1
        const type = new URL(request.url).searchParams.get('type')
        const data =
            type === 'views-visibility' && visibilitySetting
                ? [visibilitySetting]
                : []

        return HttpResponse.json(mockListAccountSettingsResponse({ data }))
    }).handler
}

describe('getOrderedSystemViews', () => {
    it('should return system views sorted by SYSTEM_VIEW_DEFINITIONS order', () => {
        const views: View[] = [
            { id: 3, name: 'All', category: 'system', uri: '/api/views/3' },
            { id: 7, name: 'Spam', category: 'system', uri: '/api/views/7' },
            { id: 1, name: 'Inbox', category: 'system', uri: '/api/views/1' },
            {
                id: 2,
                name: 'Unassigned',
                category: 'system',
                uri: '/api/views/2',
            },
        ]

        const result = getOrderedSystemViews(views)

        expect(result.map((view) => view.name)).toEqual([
            'Inbox',
            'Unassigned',
            'All',
            'Spam',
        ])
    })

    it('should return empty array when views is undefined', () => {
        expect(getOrderedSystemViews(undefined)).toEqual([])
    })

    it('should filter out views whose name is not in SYSTEM_VIEW_DEFINITIONS', () => {
        const views: View[] = [
            { id: 1, name: 'Inbox', category: 'system', uri: '/api/views/1' },
            {
                id: 99,
                name: 'My custom view',
                category: 'system',
                uri: '/api/views/99',
            },
        ]

        const result = getOrderedSystemViews(views)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Inbox')
    })

    it('should return all 7 known system views when all are present', () => {
        const views: View[] = [
            { id: 1, name: 'Inbox', category: 'system', uri: '/api/views/1' },
            {
                id: 2,
                name: 'Unassigned',
                category: 'system',
                uri: '/api/views/2',
            },
            { id: 3, name: 'All', category: 'system', uri: '/api/views/3' },
            { id: 4, name: 'Snoozed', category: 'system', uri: '/api/views/4' },
            { id: 5, name: 'Closed', category: 'system', uri: '/api/views/5' },
            { id: 6, name: 'Trash', category: 'system', uri: '/api/views/6' },
            { id: 7, name: 'Spam', category: 'system', uri: '/api/views/7' },
        ]

        const result = getOrderedSystemViews(views)

        expect(result).toHaveLength(7)
        expect(result.map((v) => v.name)).toEqual([
            'Inbox',
            'Unassigned',
            'All',
            'Snoozed',
            'Closed',
            'Trash',
            'Spam',
        ])
    })

    it('should return empty array when no views match known system view names', () => {
        const views: View[] = [
            {
                id: 99,
                name: 'My private view',
                category: 'user',
                uri: '/api/views/99',
            },
        ]

        expect(getOrderedSystemViews(views)).toEqual([])
    })
})

describe('useDefaultViews', () => {
    beforeEach(() => {
        accountSettingsRequestCount = 0
        visibilitySetting = {
            id: 42,
            type: 'views-visibility',
            data: { hidden_views: [] },
        }
        server.use(mockAccountSettingsHandler())
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(false)
        mockUseDefaultViewsSourceSdkFlagWithLoading.mockReturnValue({
            isLoading: false,
            value: false,
        })
        mockUseSdkDefaultViews.mockImplementation((options) => [
            {
                id: options?.isVisible ? 102 : 101,
                name: 'Closed',
                category: 'system',
                uri: options?.isVisible ? '/api/views/102' : '/api/views/101',
                icon: 'check-circle',
            },
        ])
        mockUseSdkDefaultViewsLoading.mockReturnValue(false)
        mockUseSdkDefaultViewsError.mockReturnValue(false)
    })

    it('should return all system views ordered by SYSTEM_VIEW_DEFINITIONS', () => {
        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.defaultSystemViews.map((v) => v.name)).toEqual([
            'Inbox',
            'Unassigned',
            'All',
            'Snoozed',
            'Closed',
            'Trash',
            'Spam',
        ])
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isEnabled: false,
        })
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isVisible: true,
            isEnabled: false,
        })
    })

    it('should use the legacy source when wayfinding is enabled but the SDK source flag is disabled', () => {
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)
        mockUseDefaultViewsSourceSdkFlagWithLoading.mockReturnValue({
            isLoading: false,
            value: false,
        })

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.defaultSystemViews.map((v) => v.name)).toEqual([
            'Inbox',
            'Unassigned',
            'All',
            'Snoozed',
            'Closed',
            'Trash',
            'Spam',
        ])
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isEnabled: false,
        })
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isVisible: true,
            isEnabled: false,
        })
    })

    it('should hold in loading state when wayfinding is enabled and the SDK source flag is loading', async () => {
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)
        mockUseDefaultViewsSourceSdkFlagWithLoading.mockReturnValue({
            isLoading: true,
            value: false,
        })

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current).toEqual({
            defaultSystemViews: [],
            visibleSystemViews: [],
            visibilitySettingId: undefined,
            isLoading: true,
            isError: false,
        })
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isEnabled: false,
        })
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isVisible: true,
            isEnabled: false,
        })
        await new Promise((resolve) => setTimeout(resolve, 0))
        expect(accountSettingsRequestCount).toBe(0)
    })

    it('should use SDK default views when wayfinding and the SDK source flag are enabled', async () => {
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)
        mockUseDefaultViewsSourceSdkFlagWithLoading.mockReturnValue({
            isLoading: false,
            value: true,
        })

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.defaultSystemViews.map((v) => v.name)).toEqual([
            'Closed',
        ])
        expect(result.current.visibleSystemViews.map((v) => v.name)).toEqual([
            'Closed',
        ])
        await waitFor(() => {
            expect(result.current.visibilitySettingId).toBe(42)
        })
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isEnabled: true,
        })
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isVisible: true,
            isEnabled: true,
        })
    })

    it('should not use SDK default views when only the SDK source flag is enabled', () => {
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(false)
        mockUseDefaultViewsSourceSdkFlagWithLoading.mockReturnValue({
            isLoading: false,
            value: true,
        })

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.defaultSystemViews.map((v) => v.name)).toEqual([
            'Inbox',
            'Unassigned',
            'All',
            'Snoozed',
            'Closed',
            'Trash',
            'Spam',
        ])
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isEnabled: false,
        })
        expect(mockUseSdkDefaultViews).toHaveBeenCalledWith({
            isVisible: true,
            isEnabled: false,
        })
    })

    it('should return all views as visible when hidden_views is empty', () => {
        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.visibleSystemViews).toHaveLength(7)
    })

    it('should return all views as visible when visibility data is not available', () => {
        visibilitySetting = undefined

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.visibleSystemViews).toHaveLength(7)
    })

    it('should filter out hidden views from visibleSystemViews', async () => {
        visibilitySetting = {
            id: 42,
            type: 'views-visibility',
            data: { hidden_views: [3, 7] },
        }

        const { result } = renderHook(() => useDefaultViews())

        await waitFor(() => {
            expect(
                result.current.visibleSystemViews.map((v) => v.name),
            ).toEqual(['Inbox', 'Unassigned', 'Snoozed', 'Closed', 'Trash'])
        })
    })

    it('should return the visibility setting id', async () => {
        const { result } = renderHook(() => useDefaultViews())

        await waitFor(() => {
            expect(result.current.visibilitySettingId).toBe(42)
        })
    })

    it('should return undefined visibilitySettingId when account settings are not loaded', () => {
        visibilitySetting = undefined

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.visibilitySettingId).toBeUndefined()
    })

    it('should set isLoading to true when account settings are loading', () => {
        server.use(
            mockListAccountSettingsHandler(
                async () => new Promise(() => undefined),
            ).handler,
        )

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.isLoading).toBe(true)
    })

    it('should set isError to true when account settings fetch fails', async () => {
        server.use(
            mockListAccountSettingsHandler(async () =>
                HttpResponse.json({} as any, { status: 500 }),
            ).handler,
        )

        const { result } = renderHook(() => useDefaultViews())

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })
})
