import _throttle from 'lodash/throttle'
import type { AnyAction } from 'redux'
import { Duration } from '@gorgias/toolkit'

import { store as reduxStore } from 'common/store'
import { toggleActiveStatus } from 'state/currentUser/actions'
import type { RootState } from 'state/types'

import { socketManager } from './socketManager/socketManager'
import { SocketEventType } from './socketManager/types'

class UserActivityManager {
    unavailabilityTimeout = Duration.minutes(10)
    inactivityTimeout = Duration.minutes(1)
    watchThrottling = Duration.seconds(15)
    userActivityFn: ReturnType<typeof setTimeout> | null = null
    userAvailabilityFn: ReturnType<typeof setTimeout> | null = null
    store = reduxStore

    /**
     * Set the current user as active and
     * set him as inactive after a period of inactivity
     */
    setCurrentUserActive = _throttle(() => {
        socketManager.send(SocketEventType.AgentActive)

        this.userActivityFn && clearTimeout(this.userActivityFn)
        this.userAvailabilityFn && clearTimeout(this.userAvailabilityFn)
        const currentUser = (this.store.getState() as RootState).currentUser

        this.userActivityFn = setTimeout(() => {
            this.store.dispatch(
                toggleActiveStatus(false) as unknown as AnyAction,
            )
        }, this.inactivityTimeout)

        this.userAvailabilityFn = setTimeout(() => {
            socketManager.send(SocketEventType.AgentInactive)
        }, this.unavailabilityTimeout)

        if (!currentUser.get('is_active')) {
            this.store.dispatch(
                toggleActiveStatus(true) as unknown as AnyAction,
            )
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

const userActivityManager = new UserActivityManager()

export { userActivityManager }
