import { renderHook } from '@repo/testing'

import useTrackPagePreview from '../useTrackPagePreview'

describe('useTrackPagePreview', () => {
    it('should return empty ref', () => {
        const { result } = renderHook(() => useTrackPagePreview())

        expect(result.current).toEqual({
            ref: { current: null },
        })
    })
})
