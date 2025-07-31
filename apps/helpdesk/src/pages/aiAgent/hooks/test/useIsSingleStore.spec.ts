import { renderHook } from '@repo/testing'

import useAppSelector from 'hooks/useAppSelector'

import { useIsSingleStore } from '../useIsSingleStore'

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = jest.mocked(useAppSelector)

describe('useIsSingleStore', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return true when there is exactly one store integration', () => {
        mockUseAppSelector.mockReturnValue([{ id: 1, name: 'Store 1' }])

        const { result } = renderHook(() => useIsSingleStore())

        expect(result.current).toBe(true)
    })

    it('should return false when there are multiple store integrations', () => {
        mockUseAppSelector.mockReturnValue([
            { id: 1, name: 'Store 1' },
            { id: 2, name: 'Store 2' },
        ])

        const { result } = renderHook(() => useIsSingleStore())

        expect(result.current).toBe(false)
    })

    it('should return false when there are no store integrations', () => {
        mockUseAppSelector.mockReturnValue([])

        const { result } = renderHook(() => useIsSingleStore())

        expect(result.current).toBe(false)
    })

    it('should return false when store integrations is null', () => {
        mockUseAppSelector.mockReturnValue(null)

        const { result } = renderHook(() => useIsSingleStore())

        expect(result.current).toBe(false)
    })
})
