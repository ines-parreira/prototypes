import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import userActivityManager from '../userActivityManager'
import socketManager from '../socketManager'
import * as socketConstants from '../../config/socketConstants'
const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('services', () => {
    describe('userActivityManager', () => {
        let store

        it('should dispatch TOGGLE_ACTIVE_STATUS and send AGENT_INACTIVE_EVENT', (done) => {
            // mark the current user as inactive
            const sendSpy = jest.fn()
            const send = socketManager.send

            store = mockStore({currentUser: fromJS({is_active: false})})

            socketManager.send = sendSpy
            userActivityManager.store = store
            userActivityManager.inactivityTimeout = 5
            userActivityManager.unavailabilityTimeout = 8
            userActivityManager.watchThrottling = 0

            userActivityManager.setCurrentUserActive()
            expect(store.getActions()).toMatchSnapshot()

            // Should send an event via websocket
            expect(sendSpy).toHaveBeenCalledWith(socketConstants.AGENT_ACTIVE)

            // mark the current user as active
            store = mockStore({currentUser: fromJS({is_active: true})})

            userActivityManager.store = store

            setTimeout(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(sendSpy).toHaveBeenCalledWith(socketConstants.AGENT_INACTIVE)
                socketManager.send = send
                done()
            }, userActivityManager.unavailabilityTimeout + 1)
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
