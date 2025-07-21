import { fromJS } from 'immutable'

import { identifyUser } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import userActivityManager from 'services/userActivityManager'
import { handle2FAEnforced } from 'state/currentUser/actions'
import { fetchVisibleViewsCounts } from 'state/views/actions'
import { renderHook } from 'utils/testing/renderHook'

import useSharedLogic from '../useSharedLogic'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
const useAppDispatchMock = useAppDispatch as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('services/userActivityManager')
jest.mock('state/currentUser/actions')
jest.mock('state/views/actions')
jest.mock('common/segment')
jest.mock('services/activityTracker')

describe('useSharedLogic', () => {
    let dispatch: jest.Mock
    const user = {
        name: 'Current User',
    }

    beforeEach(() => {
        jest.resetAllMocks()
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        useAppSelectorMock.mockReturnValue(fromJS({ ...user }))
    })

    it('should start watching for user activity', () => {
        renderHook(() => useSharedLogic())

        expect(userActivityManager.watch).toHaveBeenCalled()
    })

    it("should fetch visible views' counts", () => {
        renderHook(() => useSharedLogic())

        expect(dispatch).toHaveBeenCalledWith(fetchVisibleViewsCounts())
    })

    it('should identify user', () => {
        renderHook(() => useSharedLogic())

        expect(identifyUser).toHaveBeenCalledWith(user)
    })

    it('should check 2FA status of current user', () => {
        renderHook(() => useSharedLogic())

        expect(dispatch).toHaveBeenCalledWith(handle2FAEnforced())
    })
})
