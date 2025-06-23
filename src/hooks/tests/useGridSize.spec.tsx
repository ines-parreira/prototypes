import { waitFor } from '@testing-library/react'

import { useGridSize } from 'hooks/useGridSize'
import { mockRequestAnimationFrame, triggerWidthResize } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const rafControl = mockRequestAnimationFrame()

describe('useGridSize', () => {
    beforeEach(() => {
        triggerWidthResize(1920)
    })

    it.each([
        { screenSize: 420, defaultGreedSize: 6, expectedValue: 12 },
        { screenSize: 800, defaultGreedSize: 6, expectedValue: 6 },
        { screenSize: 1920, defaultGreedSize: 4, expectedValue: 4 },
    ])(
        'returns grid cell size based on screen size $screenSize px',
        async ({ screenSize, defaultGreedSize, expectedValue }) => {
            const { result } = renderHook(() => useGridSize())

            triggerWidthResize(screenSize)
            rafControl.run()

            await waitFor(() => {
                expect(result.current(defaultGreedSize)).toBe(expectedValue)
            })
        },
    )
})
