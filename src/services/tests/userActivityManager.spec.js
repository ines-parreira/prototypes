import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import userActivityManager from '../userActivityManager'
const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('services', () => {
    describe('userActivityManager', () => {
        let store

        it('should dispatch TOGGLE_ACTIVE_STATUS', (done) => {
            // mark the current user as inactive
            store = mockStore({currentUser: fromJS({is_active: false})})
            userActivityManager.store = store
            userActivityManager.inactivityTimeout = 5
            userActivityManager.watchThrottling = 0

            userActivityManager.setCurrentUserActive()
            expect(store.getActions()).toMatchSnapshot()

            // mark the current user as active
            store = mockStore({currentUser: fromJS({is_active: true})})
            userActivityManager.store = store

            setTimeout(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            }, userActivityManager.inactivityTimeout + 1)
        })

        it('should watch user activity', () => {
            const spy = jest.fn()
            document.addEventListener = spy
            userActivityManager.watch()
            expect(spy).toHaveBeenCalledTimes(3)
            expect(spy).toHaveBeenCalledWith('mousemove', userActivityManager.setCurrentUserActive)
            expect(spy).toHaveBeenCalledWith('touchstart', userActivityManager.setCurrentUserActive)
            expect(spy).toHaveBeenCalledWith('keydown', userActivityManager.setCurrentUserActive)

        })
    })
})
