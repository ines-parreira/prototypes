import {renderHook} from '@testing-library/react-hooks'

import {useFlag} from 'common/flags'
import useAppSelector from 'hooks/useAppSelector'
import {isAdmin} from 'utils'

import useHasAutoQA from '../useHasAutoQA'

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = useFlag as jest.Mock

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('utils', () => ({isAdmin: jest.fn()}))
const isAdminMock = isAdmin as jest.Mock

describe('useHasAutoQA', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue({id: 1})
        isAdminMock.mockReturnValue(false)
    })

    it('should return false if the flag is disabled', () => {
        const {result} = renderHook(() => useHasAutoQA())
        expect(result.current).toBe(false)
    })

    it('should return false if the current user is not an admin', () => {
        useFlagMock.mockReturnValue(true)
        const {result} = renderHook(() => useHasAutoQA())
        expect(result.current).toBe(false)
    })

    it('should return true if the flag is enabled and the user is an admin', () => {
        useFlagMock.mockReturnValue(true)
        isAdminMock.mockReturnValue(true)
        const {result} = renderHook(() => useHasAutoQA())
        expect(result.current).toBe(true)
    })
})
