import * as SegmentTracker from '@repo/logging'
import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/types'

import { useLogMigrationEvent } from './useLogMigrationEvent'

const defaultState = {
    currentAccount: fromJS({
        id: 123,
        domain: 'test-domain',
    }),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                meta: {
                    shop_type: IntegrationType.Shopify,
                    shop_name: 'test-shop',
                },
            },
        ],
    }),
}

const renderUseLogMigrationEvent = (
    storeState = defaultState,
    initialEntry = '/1',
) =>
    renderHook(() => useLogMigrationEvent(), {
        initialEntries: [initialEntry],
        path: '/:integrationId',
        storeState,
    })

describe('useLogMigrationEvent()', () => {
    const commonProps = {
        account_id: 123,
        account_domain: 'test-domain',
        shop_type: 'shopify',
        shop_name: 'test-shop',
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

    describe('account_id and shop_name properties', () => {
        it('sources account_id from the current account and shop_name from the integration meta', () => {
            const { result } = renderUseLogMigrationEvent()

            result.current.logBannerViewed()

            expect(logEventSpy).toHaveBeenCalledWith(
                SegmentTracker.SegmentEvent.ChatMigrationBannerViewed,
                expect.objectContaining({
                    account_id: 123,
                    shop_name: 'test-shop',
                }),
            )
        })

        it('emits an undefined account_id when the current account has no id', () => {
            const { result } = renderUseLogMigrationEvent({
                ...defaultState,
                currentAccount: fromJS({ domain: 'test-domain' }),
            })

            result.current.logBannerViewed()

            expect(logEventSpy).toHaveBeenCalledWith(
                SegmentTracker.SegmentEvent.ChatMigrationBannerViewed,
                expect.objectContaining({ account_id: undefined }),
            )
        })

        it('emits an undefined shop_name when the integration meta has no shop_name', () => {
            const { result } = renderUseLogMigrationEvent({
                ...defaultState,
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            meta: { shop_type: IntegrationType.Shopify },
                        },
                    ],
                }),
            })

            result.current.logBannerViewed()

            expect(logEventSpy).toHaveBeenCalledWith(
                SegmentTracker.SegmentEvent.ChatMigrationBannerViewed,
                expect.objectContaining({ shop_name: undefined }),
            )
        })

        it('emits undefined shop_type and shop_name when no integration matches the route', () => {
            const { result } = renderUseLogMigrationEvent(defaultState, '/999')

            result.current.logBannerViewed()

            expect(logEventSpy).toHaveBeenCalledWith(
                SegmentTracker.SegmentEvent.ChatMigrationBannerViewed,
                expect.objectContaining({
                    shop_type: undefined,
                    shop_name: undefined,
                    chat_integration_id: 999,
                }),
            )
        })

        it('emits an undefined chat_integration_id when the route param is not numeric', () => {
            const { result } = renderUseLogMigrationEvent(
                defaultState,
                '/not-a-number',
            )

            result.current.logBannerViewed()

            expect(logEventSpy).toHaveBeenCalledWith(
                SegmentTracker.SegmentEvent.ChatMigrationBannerViewed,
                expect.objectContaining({ chat_integration_id: undefined }),
            )
        })
    })
})
