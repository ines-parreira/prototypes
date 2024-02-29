import {renderHook} from '@testing-library/react-hooks'

import useAppSelector from 'hooks/useAppSelector'

import useHasPhone from '../useHasPhone'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

describe('useHasPhone', () => {
    it('should return false if the account has no phone integration', () => {
        useAppSelectorMock.mockReturnValue(false)
        const {result} = renderHook(() => useHasPhone())
        expect(result.current).toBe(false)
    })

    it('should return true if the account has a phone integration', () => {
        useAppSelectorMock.mockReturnValue(true)
        const {result} = renderHook(() => useHasPhone())
        expect(result.current).toBe(true)
    })
})
