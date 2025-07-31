import { renderHook } from '@repo/testing'

import { useTaskDisplayLimit } from '../useTaskDisplayLimit'

jest.mock('pages/common/utils/mobile', () => ({
    isMediumOrSmallScreen: jest.fn(),
    isExtraLargeScreen: jest.fn(),
}))

const { isMediumOrSmallScreen, isExtraLargeScreen } = jest.requireMock(
    'pages/common/utils/mobile',
)

describe('useTaskDisplayLimit', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns 4 when screen is extra large', () => {
        isMediumOrSmallScreen.mockReturnValue(false)
        isExtraLargeScreen.mockReturnValue(true)

        const { result } = renderHook(() => useTaskDisplayLimit())
        expect(result.current).toBe(4)
    })

    it('returns 3 for default/fallback case', () => {
        isMediumOrSmallScreen.mockReturnValue(false)
        isExtraLargeScreen.mockReturnValue(false)

        const { result } = renderHook(() => useTaskDisplayLimit())
        expect(result.current).toBe(3)
    })

    it('prioritizes isMediumOrSmallScreen over isExtraLargeScreen', () => {
        isMediumOrSmallScreen.mockReturnValue(true)
        isExtraLargeScreen.mockReturnValue(true)

        const { result } = renderHook(() => useTaskDisplayLimit())

        expect(result.current).toBe(3)
    })
})
