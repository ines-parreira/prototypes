import {renderHook} from '@testing-library/react-hooks'
import {mockRequestAnimationFrame, triggerWidthResize} from 'utils/testing'
import {useGridSize} from 'hooks/useGridSize'

const rafControl = mockRequestAnimationFrame()

describe('useGridSize', () => {
    beforeEach(() => {
        triggerWidthResize(1920)
    })

    it.each([
        {screenSize: 420, defaultGreedSize: 6, expectedValue: 12},
        {screenSize: 800, defaultGreedSize: 6, expectedValue: 6},
        {screenSize: 1920, defaultGreedSize: 4, expectedValue: 4},
    ])(
        'returns grid cell size based on screen size $screenSize px',
        ({screenSize, defaultGreedSize, expectedValue}) => {
            const {result} = renderHook(() => useGridSize())

            triggerWidthResize(screenSize)
            rafControl.run()

            expect(result.current(defaultGreedSize)).toBe(expectedValue)
        }
    )
})
