import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'

import { usePrivateViewsOrdering } from '../usePrivateViewsOrdering'

const win = window as Record<string, any>
let savedGorgiasState: unknown

beforeAll(() => {
    savedGorgiasState = win.GORGIAS_STATE
})

afterEach(() => {
    win.GORGIAS_STATE = savedGorgiasState
})

describe('usePrivateViewsOrdering', () => {
    it('returns empty ordering when no settings exist on window', () => {
        const { result } = renderHook(() => usePrivateViewsOrdering())

        expect(result.current).toEqual({ views: {}, view_sections: {} })
    })

    it('reads ordering from window.GORGIAS_STATE', async () => {
        const ordering = {
            views: { '1': { display_order: 3 } },
            view_sections: { '2': { display_order: 1 } },
        }

        win.GORGIAS_STATE = {
            ...win.GORGIAS_STATE,
            currentUser: {
                ...win.GORGIAS_STATE?.currentUser,
                settings: [{ id: 77, type: 'views-ordering', data: ordering }],
            },
        }

        const { result } = renderHook(() => usePrivateViewsOrdering())

        await waitFor(() => {
            expect(result.current).toEqual(ordering)
        })
    })
})
