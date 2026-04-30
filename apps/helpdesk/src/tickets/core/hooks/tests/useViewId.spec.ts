import { renderHook } from '@repo/testing'

import useViewId from '../useViewId'

jest.mock('hooks/useAppSelector', () => jest.fn(() => 987789))

describe('useViewId', () => {
    it('should return the default view id if no view id is in the url', () => {
        const { result } = renderHook(() => useViewId(), {
            initialEntries: ['/views'],
            path: '/views/:viewId?',
        })
        expect(result.current).toBe(987789)
    })

    it('should return the view id from the url if available', () => {
        const { result } = renderHook(() => useViewId(), {
            initialEntries: ['/views/123456'],
            path: '/views/:viewId',
        })
        expect(result.current).toBe(123456)
    })
})
