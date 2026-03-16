import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import useHasRecharge from '../useHasRecharge'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

describe('useHasRecharge', () => {
    it('should return false when the customer has no recharge integration', () => {
        useAppSelectorMock.mockReturnValueOnce(fromJS({ 1: {} }))
        useAppSelectorMock.mockReturnValueOnce([{ id: 2 }])

        const { result } = renderHook(() => useHasRecharge())

        expect(result.current).toBe(false)
    })

    it('should return true when the customer has a recharge integration', () => {
        useAppSelectorMock.mockReturnValueOnce(fromJS({ 2: {} }))
        useAppSelectorMock.mockReturnValueOnce([{ id: 2 }])

        const { result } = renderHook(() => useHasRecharge())

        expect(result.current).toBe(true)
    })
})
