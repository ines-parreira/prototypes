import { user } from 'fixtures/users'
import { mockProductionEnvironment } from 'utils/testing'

import { identifyUser, logEventWithSampling } from '../segment'
import { SegmentEvent } from '../types'

describe('segmentTracker', () => {
    const analytics = globalThis.analytics

    beforeEach(() => {
        mockProductionEnvironment()
    })

    afterEach(() => {
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
                    role: user.role.name,
                    created_at: user.created_datetime,
                    notification_permission: 'granted',
                },
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

        it('should log event with sampling', () => {
            logEventWithSampling(
                SegmentEvent.AiAgentCopiedToEditor,
                { prop: 'value' },
                1,
            )

            expect(window.analytics.track).toHaveBeenCalledTimes(1)
            expect(window.analytics.track).toHaveBeenNthCalledWith(
                1,
                SegmentEvent.AiAgentCopiedToEditor,
                {
                    prop: 'value',
                },
            )
        })

        it('should not log event with sampling', () => {
            logEventWithSampling(
                SegmentEvent.AiAgentCopiedToEditor,
                { prop: 'value' },
                0,
            )

            expect(window.analytics.track).not.toHaveBeenCalled()
        })

        it('should use default sample rate', () => {
            jest.spyOn(global.Math, 'random').mockReturnValue(0.001)
            logEventWithSampling(SegmentEvent.AiAgentCopiedToEditor)

            expect(window.analytics.track).toHaveBeenCalledTimes(1)
            expect(window.analytics.track).toHaveBeenNthCalledWith(
                1,
                SegmentEvent.AiAgentCopiedToEditor,
                {},
            )
        })
    })
})
