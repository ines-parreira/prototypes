import _throttle from 'lodash/throttle'

import {store as reduxStore} from '../init'
import {toggleActiveStatus} from '../state/currentUser/actions'
import * as socketConstants from '../config/socketConstants'

import socketManager from './socketManager'


class UserActivityManager {
    unavailabilityTimeout = 600000 // 10 minutes
    inactivityTimeout = 60000 // 1 min
    watchThrottling = 15000 // 15 secs
    userActivityFn = null
    store = reduxStore

    /**
     * Set the current user as active and
     * set him as inactive after a period of inactivity
     */
    setCurrentUserActive = _throttle(() => {
        socketManager.send(socketConstants.AGENT_ACTIVE)

        clearTimeout(this.userActivityFn)
        clearTimeout(this.userAvailabilityFn)
        const currentUser = this.store.getState().currentUser

        this.userActivityFn = setTimeout(() => {
            this.store.dispatch(toggleActiveStatus(false))
        }, this.inactivityTimeout)

        this.userAvailabilityFn = setTimeout(() => {
            socketManager.send(socketConstants.AGENT_INACTIVE)
        }, this.unavailabilityTimeout)

        if (!currentUser.get('is_active')) {
            this.store.dispatch(toggleActiveStatus(true))
        }
    }, this.watchThrottling)

    watch = () => {
        // Set the current user as active if he moves
        // his mouse or touches the screen of his device
        document.addEventListener('mousemove', this.setCurrentUserActive)
        document.addEventListener('touchstart', this.setCurrentUserActive)
        document.addEventListener('keydown', this.setCurrentUserActive)

        this.setCurrentUserActive()
    }
}


export default new UserActivityManager()
