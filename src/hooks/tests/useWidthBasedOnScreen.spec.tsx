import { useWidthBasedOnScreen } from 'hooks/useWidthBasedOnScreen'
import { mockRequestAnimationFrame, triggerWidthResize } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const rafControl = mockRequestAnimationFrame()

describe('useWidthBasedOnScreen', () => {
    beforeEach(() => {
        triggerWidthResize(1920)
    })

    it.each([
        {
            screenSize: 420,
            baseWidth: 200,
            smallScreenWidth: 120,
            expectedValue: 120,
        },
        {
            screenSize: 800,
            baseWidth: 400,
            smallScreenWidth: 200,
            expectedValue: 400,
        },
        {
            screenSize: 1920,
            baseWidth: 400,
            smallScreenWidth: 85,
            expectedValue: 400,
        },
    ])(
        'should return width based on $screenSize size',
        ({ screenSize, baseWidth, smallScreenWidth, expectedValue }) => {
            const { result } = renderHook(() => useWidthBasedOnScreen())

            triggerWidthResize(screenSize)
            rafControl.run()

            expect(result.current(baseWidth, smallScreenWidth)).toBe(
                expectedValue,
            )
        },
    )
})
