import { renderHook } from '@repo/testing/vitest'

import type { View } from '@gorgias/helpdesk-types'

import { useAllViewsOrdered } from '../useAllViewsOrdered'
import { usePrivateViews } from '../usePrivateViews'
import { usePublicViews } from '../usePublicViews'
import type { SystemView } from '../useSystemViews'
import { useSystemViews } from '../useSystemViews'

vi.mock('../useSystemViews', () => ({ useSystemViews: vi.fn() }))
vi.mock('../usePublicViews', () => ({ usePublicViews: vi.fn() }))
vi.mock('../usePrivateViews', () => ({ usePrivateViews: vi.fn() }))

const useSystemViewsMock = vi.mocked(useSystemViews)
const usePublicViewsMock = vi.mocked(usePublicViews)
const usePrivateViewsMock = vi.mocked(usePrivateViews)

function makeView(id: number, name: string): View {
    return { id, name } as View
}

function makeSystemView(id: number, name: string): SystemView {
    return { id, name, icon: null } as SystemView
}

beforeEach(() => {
    vi.clearAllMocks()
    useSystemViewsMock.mockReturnValue([])
    usePublicViewsMock.mockReturnValue([])
    usePrivateViewsMock.mockReturnValue([])
})

describe('useAllViewsOrdered', () => {
    it('concatenates system → public → private', () => {
        useSystemViewsMock.mockReturnValue([makeSystemView(1, 'Inbox')])
        usePublicViewsMock.mockReturnValue([makeView(2, 'Bugs')])
        usePrivateViewsMock.mockReturnValue([makeView(3, 'My Drafts')])

        const { result } = renderHook(() => useAllViewsOrdered())

        expect(result.current.map((v) => v.id)).toEqual([1, 2, 3])
    })

    it('dedupes by id, keeping the first occurrence', () => {
        useSystemViewsMock.mockReturnValue([makeSystemView(1, 'Inbox')])
        usePublicViewsMock.mockReturnValue([
            makeView(1, 'Inbox dup'),
            makeView(2, 'Bugs'),
        ])
        usePrivateViewsMock.mockReturnValue([])

        const { result } = renderHook(() => useAllViewsOrdered())

        expect(result.current.map((v) => v.id)).toEqual([1, 2])
        expect(result.current[0].name).toBe('Inbox')
    })

    it('skips views with a null id', () => {
        useSystemViewsMock.mockReturnValue([])
        usePublicViewsMock.mockReturnValue([
            { ...makeView(1, 'Bugs'), id: null as unknown as number },
            makeView(2, 'CSAT'),
        ])
        usePrivateViewsMock.mockReturnValue([])

        const { result } = renderHook(() => useAllViewsOrdered())

        expect(result.current.map((v) => v.id)).toEqual([2])
    })

    it('returns an empty list when no source produces views', () => {
        const { result } = renderHook(() => useAllViewsOrdered())

        expect(result.current).toEqual([])
    })
})
