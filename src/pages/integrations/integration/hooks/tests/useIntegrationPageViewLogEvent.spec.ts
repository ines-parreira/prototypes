import {Map} from 'immutable'
import {renderHook} from 'react-hooks-testing-library'
import * as segmentTracker from 'store/middlewares/segmentTracker'

import useIntegrationPageViewLogEvent from '../useIntegrationPageViewLogEvent'

const logEventSpy = jest.spyOn(segmentTracker, 'logEvent')
const {SegmentEvent} = segmentTracker

describe('useIntegrationPageViewLogEvent', () => {
    afterEach(() => {
        logEventSpy.mockClear()
    })

    describe('when render with "isReady" as false', () => {
        beforeAll(() => {
            renderHook(() =>
                useIntegrationPageViewLogEvent(
                    SegmentEvent.ChatSettingsAppearancePageViewed,
                    {
                        isReady: false,
                        integration: Map<any, any>(),
                    }
                )
            )
        })

        it('should not call "logEvent" function', () => {
            expect(logEventSpy).not.toHaveBeenCalled
        })
    })

    describe('when render with "isReady" as true', () => {
        describe('with integration id', () => {
            beforeAll(() => {
                renderHook(() =>
                    useIntegrationPageViewLogEvent(
                        SegmentEvent.ChatSettingsAppearancePageViewed,
                        {
                            isReady: true,
                            integration: Map<any, any>([['id', '1']]),
                        }
                    )
                )
            })

            it('should call "logEvent" function', () => {
                expect(logEventSpy).toHaveBeenCalledWith(
                    SegmentEvent.ChatSettingsAppearancePageViewed,
                    {id: '1'}
                )
            })
        })

        describe('without integration id', () => {
            beforeAll(() => {
                renderHook(() =>
                    useIntegrationPageViewLogEvent(
                        SegmentEvent.ChatSettingsAppearancePageViewed,
                        {
                            isReady: true,
                            integration: Map<any, any>(),
                        }
                    )
                )
            })

            it('should call "logEvent" function', () => {
                expect(logEventSpy).toHaveBeenCalledWith(
                    SegmentEvent.ChatSettingsAppearancePageViewed,
                    {}
                )
            })
        })
    })
})
