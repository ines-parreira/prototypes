import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import userActivityManager from 'services/userActivityManager'
import {handle2FAEnforced} from 'state/currentUser/actions'
import {fetchVisibleViewsCounts} from 'state/views/actions'
import {identifyUser} from 'store/middlewares/segmentTracker'

import useSharedLogic from '../useSharedLogic'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppDispatchMock = useAppDispatch as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('services/userActivityManager', () => ({
    watch: jest.fn(),
}))
jest.mock('state/currentUser/actions', () => ({
    handle2FAEnforced: jest.fn(),
}))
jest.mock('state/views/actions', () => ({
    fetchVisibleViewsCounts: jest.fn(),
}))
jest.mock('store/middlewares/segmentTracker', () => ({
    identifyUser: jest.fn(),
}))

// const handle2FAEnforcedMock = handle2FAEnforced as jest.Mock
// const fetchVisibleViewsCountsMock = fetchVisibleViewsCounts as jest.Mock
// const identifyUserMock = identifyUser as jest.Mock

describe('useSharedLogic', () => {
    let dispatch: jest.Mock
    const user = {
        name: 'Current User',
    }

    beforeEach(() => {
        jest.resetAllMocks()
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        useAppSelectorMock.mockReturnValue(fromJS({...user}))
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
