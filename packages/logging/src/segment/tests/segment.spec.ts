import { deprecatedEvents } from '../deprecated-events'
import { identifyUser, logEvent, logEventWithSampling } from '../segment'
import { SegmentEvent } from '../types'

const mockUser = {
    name: 'Alex Plugaru',
    email: 'alex@gorgias.io',
    country: 'US',
    role: { name: 'admin' },
    created_datetime: '2016-12-22T19:36:12.487448+00:00',
    notification_permission: 'granted',
}

describe('segmentTracker', () => {
    const analytics = globalThis.analytics

    beforeEach(() => {
        // Mock production environment
        window.PRODUCTION = true
        window.STAGING = false
        window.DEVELOPMENT = false
        vi.clearAllMocks()
    })

    afterEach(() => {
        globalThis.analytics = analytics
        window.USER_IMPERSONATED = null
    })

    describe('logEvent', () => {
        it('should track a non-deprecated event', () => {
            logEvent(SegmentEvent.AiAgentCopiedToEditor, { prop: 'value' })

            expect(window.analytics.track).toHaveBeenCalledTimes(1)
            expect(window.analytics.track).toHaveBeenCalledWith(
                SegmentEvent.AiAgentCopiedToEditor,
                { prop: 'value' },
            )
        })

        it('should not track a deprecated event', () => {
            const deprecatedEvent = deprecatedEvents[0]
            logEvent(deprecatedEvent, { prop: 'value' })

            expect(window.analytics.track).not.toHaveBeenCalled()
        })

        it('should not track when the user is impersonated', () => {
            window.USER_IMPERSONATED = true
            logEvent(SegmentEvent.AiAgentCopiedToEditor)

            expect(window.analytics.track).not.toHaveBeenCalled()
        })

        it('should not track when analytics is undefined', () => {
            // @ts-ignore: analytics is optional
            delete globalThis.analytics
            logEvent(SegmentEvent.AiAgentCopiedToEditor)

            expect(analytics.track).not.toHaveBeenCalled()
        })
    })

    describe('identifyUser', () => {
        it('should identify the user', () => {
            identifyUser(mockUser)

            expect(window.analytics.identify).toHaveBeenNthCalledWith(
                1,
                window.SEGMENT_ANALYTICS_USER_ID,
                {
                    gorgias_subdomain: 'localhost',
                    name: mockUser.name,
                    email: mockUser.email,
                    country: mockUser.country,
                    role: mockUser.role.name,
                    created_at: mockUser.created_datetime,
                    notification_permission: 'granted',
                },
            )
        })

        it('should not identify the user when the user is impersonated', () => {
            window.USER_IMPERSONATED = true
            identifyUser(mockUser)

            expect(window.analytics.identify).not.toHaveBeenCalled()
        })

        it('should not identify the user when the analytics are undefined', () => {
            // @ts-ignore: analytics is optional
            delete globalThis.analytics
            identifyUser(mockUser)

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
            vi.spyOn(global.Math, 'random').mockReturnValue(0.001)
            logEventWithSampling(SegmentEvent.AiAgentCopiedToEditor)

            expect(window.analytics.track).toHaveBeenCalledTimes(1)
            expect(window.analytics.track).toHaveBeenNthCalledWith(
                1,
                SegmentEvent.AiAgentCopiedToEditor,
                {},
            )
        })

        it('should not track a deprecated event even when sampled', () => {
            const deprecatedEvent = deprecatedEvents[0]
            logEventWithSampling(deprecatedEvent, {}, 1)

            expect(window.analytics.track).not.toHaveBeenCalled()
        })
    })
})
