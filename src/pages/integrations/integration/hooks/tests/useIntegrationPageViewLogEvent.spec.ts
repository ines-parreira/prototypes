import { Map } from 'immutable'

import * as segmentTracker from 'common/segment'
import { renderHook } from 'utils/testing/renderHook'

import useIntegrationPageViewLogEvent from '../useIntegrationPageViewLogEvent'

const logEventSpy = jest.spyOn(segmentTracker, 'logEvent')
const { SegmentEvent } = segmentTracker

describe('useIntegrationPageViewLogEvent', () => {
    afterEach(() => {
        logEventSpy.mockClear()
    })

    it('should not call "logEvent" when "isReady" is false', () => {
        renderHook(() =>
            useIntegrationPageViewLogEvent(
                SegmentEvent.ChatSettingsAppearancePageViewed,
                {
                    isReady: false,
                    integration: Map<any, any>(),
                },
            ),
        )
        expect(logEventSpy).not.toHaveBeenCalled()
    })

    it('should call "logEvent" when "isReady" is true and integration has id', () => {
        renderHook(() =>
            useIntegrationPageViewLogEvent(
                SegmentEvent.ChatSettingsAppearancePageViewed,
                {
                    isReady: true,
                    integration: Map<any, any>([['id', '1']]),
                },
            ),
        )

        expect(logEventSpy).toHaveBeenCalledWith(
            SegmentEvent.ChatSettingsAppearancePageViewed,
            { id: '1' },
        )
    })

    it('should call "logEvent" when "isReady" is true and integration has no id', () => {
        renderHook(() =>
            useIntegrationPageViewLogEvent(
                SegmentEvent.ChatSettingsAppearancePageViewed,
                {
                    isReady: true,
                    integration: Map<any, any>(),
                },
            ),
        )

        expect(logEventSpy).toHaveBeenCalledWith(
            SegmentEvent.ChatSettingsAppearancePageViewed,
            {},
        )
    })
})
