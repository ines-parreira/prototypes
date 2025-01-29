import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import {UserRole} from 'config/types/user'
import {useFlag} from 'core/flags'
import {getCurrentUser} from 'state/currentUser/selectors'

import useHasAutoQA from '../useHasAutoQA'

jest.mock('core/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = useFlag as jest.Mock

jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())

jest.mock('state/currentUser/selectors', () => ({getCurrentUser: jest.fn()}))
const getCurrentUserMock = getCurrentUser as unknown as jest.Mock

describe('useHasAutoQA', () => {
    beforeEach(() => {
        getCurrentUserMock.mockReturnValue(
            fromJS({
                id: 1,
                role: {name: UserRole.BasicAgent},
            })
        )
        useFlagMock.mockReturnValue(false)
    })

    it('should return false if the flag is disabled', () => {
        const {result} = renderHook(() => useHasAutoQA())
        expect(result.current).toBe(false)
    })

    it('should return false if the current user is not an admin, lead agent or account owner', () => {
        useFlagMock.mockReturnValue(true)
        const {result} = renderHook(() => useHasAutoQA())
        expect(result.current).toBe(false)
    })

    it.each([
        ['a lead agent', UserRole.Agent],
        ['an admin', UserRole.Admin],
    ])(
        'should return true if the flag is enabled and the user is %s',
        (_roleStr, role) => {
            useFlagMock.mockReturnValue(true)
            getCurrentUserMock.mockReturnValue(
                fromJS({
                    id: 1,
                    role: {name: role},
                })
            )
            const {result} = renderHook(() => useHasAutoQA())
            expect(result.current).toBe(true)
        }
    )
})
