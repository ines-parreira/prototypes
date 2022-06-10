import {user} from 'fixtures/users'
import {mockProductionEnvironment} from 'utils/testing'

import {identifyUser} from '../segmentTracker'

describe('segmentTracker', () => {
    const analytics = globalThis.analytics

    beforeEach(() => {
        mockProductionEnvironment()
    })

    afterEach(() => {
        jest.clearAllMocks()
        globalThis.analytics = analytics
        window.USER_IMPERSONATED = null
    })

    describe('identifyUser', () => {
        it('should identify the user', () => {
            identifyUser(user)

            expect(window.analytics.identify).toHaveBeenNthCalledWith(
                1,
                window.SEGMENT_ANALYTICS_USER_ID,
                {
                    gorgias_subdomain: 'localhost',
                    name: user.name,
                    email: user.email,
                    country: user.country,
                    role: user.roles[0].name,
                    created_at: user.created_datetime,
                    notification_permission: 'granted',
                }
            )
        })

        it('should not identify the user when the user is impersonated', () => {
            window.USER_IMPERSONATED = true
            identifyUser(user)

            expect(window.analytics.identify).not.toHaveBeenCalled()
        })

        it('should not identify the user when the analytics are undefined', () => {
            // @ts-ignore: analytics is optional
            delete globalThis.analytics
            identifyUser(user)

            expect(analytics.identify).not.toHaveBeenCalled()
        })
    })
})
