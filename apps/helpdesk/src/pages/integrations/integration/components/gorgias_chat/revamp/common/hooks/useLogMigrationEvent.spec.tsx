import * as SegmentTracker from '@repo/logging'
import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/types'

import { useLogMigrationEvent } from './useLogMigrationEvent'

const defaultState = {
    currentAccount: fromJS({
        domain: 'test-domain',
    }),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                meta: {
                    shop_type: IntegrationType.Shopify,
                },
            },
        ],
    }),
}

const renderUseLogMigrationEvent = () =>
    renderHook(() => useLogMigrationEvent(), {
        initialEntries: ['/1'],
        path: '/:integrationId',
        storeState: defaultState,
    })

describe('useLogMigrationEvent()', () => {
    const commonProps = {
        account_domain: 'test-domain',
        shop_type: 'shopify',
        chat_integration_id: 1,
    }

    let logEventSpy: jest.SpyInstance

    beforeEach(() => {
        logEventSpy = jest.spyOn(SegmentTracker, 'logEvent')
    })

    afterEach(() => {
        logEventSpy.mockRestore()
    })

    it('logs the banner viewed event with the common properties', () => {
        const { result } = renderUseLogMigrationEvent()

        result.current.logBannerViewed()

        expect(logEventSpy).toHaveBeenCalledWith(
            SegmentTracker.SegmentEvent.ChatMigrationBannerViewed,
            commonProps,
        )
    })

    it('logs the preview mode switched event with from/to', () => {
        const { result } = renderUseLogMigrationEvent()

        result.current.logPreviewModeSwitched({
            from: 'old-chat',
            to: 'new-chat',
        })

        expect(logEventSpy).toHaveBeenCalledWith(
            SegmentTracker.SegmentEvent.ChatMigrationPreviewModeSwitched,
            { ...commonProps, from: 'old-chat', to: 'new-chat' },
        )
    })

    it('logs the business hours toggled event with the target mode', () => {
        const { result } = renderUseLogMigrationEvent()

        result.current.logBusinessHoursToggled({ to: 'outside' })

        expect(logEventSpy).toHaveBeenCalledWith(
            SegmentTracker.SegmentEvent.ChatMigrationBusinessHoursToggled,
            { ...commonProps, to: 'outside' },
        )
    })

    it('logs the opt-in confirmed event', () => {
        const { result } = renderUseLogMigrationEvent()

        result.current.logOptInConfirmed()

        expect(logEventSpy).toHaveBeenCalledWith(
            SegmentTracker.SegmentEvent.ChatMigrationOptInConfirmed,
            commonProps,
        )
    })

    it('logs the opt-out clicked event with the time since opt-in', () => {
        const { result } = renderUseLogMigrationEvent()

        result.current.logOptOutClicked({ timeSinceOptInSeconds: 42 })

        expect(logEventSpy).toHaveBeenCalledWith(
            SegmentTracker.SegmentEvent.ChatMigrationOptOutClicked,
            { ...commonProps, time_since_opt_in_seconds: 42 },
        )
    })
})
