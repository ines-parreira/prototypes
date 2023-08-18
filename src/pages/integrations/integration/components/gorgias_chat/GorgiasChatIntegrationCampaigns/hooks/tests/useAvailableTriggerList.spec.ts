import {renderHook} from '@testing-library/react-hooks'

import {TRIGGER_LIST} from '../../constants/triggers'

import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'
import {ExitIntentOperators} from '../../types/enums/ExitIntentOperators.enum'
import {SessionTimeOperators} from '../../types/enums/SessionTimeOperators.enum'

import {useAvailableTriggerList} from '../useAvailableTriggerList'

describe('useAvailableTriggerList()', () => {
    describe('Merchant IS NOT a revenue subscriber and DOES NOT HAVE a Shopify chat', () => {
        it('returns only legacy triggers', () => {
            const {result} = renderHook(() =>
                useAvailableTriggerList({
                    isRevenueBetaTester: false,
                    isShopifyStore: false,
                })
            )

            expect(result.current).toStrictEqual([
                {
                    key: CampaignTriggerKey.CurrentUrl,
                    label: 'Current URL',
                    group: 'Behavior',
                    defaults: {value: '/', operator: 'eq'},
                    requirements: {},
                },
                {
                    key: CampaignTriggerKey.TimeSpentOnPage,
                    label: 'Time spent on page',
                    group: 'Behavior',
                    defaults: {value: 0, operator: 'gt'},
                    requirements: {},
                },
            ])
        })
    })

    describe('Merchant IS NOT a revenue subscriber and HAS a Shopify chat', () => {
        it('returns legacy triggers', () => {
            const {result} = renderHook(() =>
                useAvailableTriggerList({
                    isRevenueBetaTester: false,
                    isShopifyStore: true,
                })
            )

            expect(result.current).toStrictEqual([
                {
                    key: CampaignTriggerKey.CurrentUrl,
                    label: 'Current URL',
                    group: 'Behavior',
                    defaults: {value: '/', operator: 'eq'},
                    requirements: {},
                },
                {
                    key: CampaignTriggerKey.TimeSpentOnPage,
                    label: 'Time spent on page',
                    group: 'Behavior',
                    defaults: {value: 0, operator: 'gt'},
                    requirements: {},
                },
            ])
        })
    })

    describe('Merchant IS a revenue subscriber and DOES NOT HAVE a Shopify chat', () => {
        it('returns both legacy and advanced (non Shopify) triggers', () => {
            const {result} = renderHook(() =>
                useAvailableTriggerList({
                    isRevenueBetaTester: true,
                    isShopifyStore: false,
                })
            )

            expect(result.current).toStrictEqual([
                {
                    key: CampaignTriggerKey.CurrentUrl,
                    label: 'Current URL',
                    group: 'Behavior',
                    defaults: {value: '/', operator: 'eq'},
                    requirements: {},
                },
                {
                    key: CampaignTriggerKey.TimeSpentOnPage,
                    label: 'Time spent on page',
                    group: 'Behavior',
                    defaults: {value: 0, operator: 'gt'},
                    requirements: {},
                },
                {
                    key: CampaignTriggerKey.VisitCount,
                    label: 'Number of visits',
                    group: 'Behavior',
                    defaults: {value: 0, operator: 'gt'},
                    requirements: {
                        revenue: true,
                    },
                },
                {
                    key: CampaignTriggerKey.SessionTime,
                    label: 'Time spent per visit',
                    group: 'Behavior',
                    defaults: {
                        value: 0,
                        operator: SessionTimeOperators.GreaterThan,
                    },
                    requirements: {
                        revenue: true,
                    },
                },
                {
                    key: CampaignTriggerKey.ExitIntent,
                    label: 'Exit intent',
                    group: 'Behavior',
                    defaults: {
                        value: 'true',
                        operator: ExitIntentOperators.Equal,
                    },
                    requirements: {
                        revenue: true,
                    },
                },
                {
                    key: CampaignTriggerKey.BusinessHours,
                    label: 'Business hours',
                    group: 'Other',
                    defaults: {value: true, operator: 'during'},
                    requirements: {revenue: true},
                },
            ])
        })
    })

    describe('Merchant IS a revenue subscriber and HAS a Shopify chat', () => {
        it('returns all triggers', () => {
            const {result} = renderHook(() =>
                useAvailableTriggerList({
                    isRevenueBetaTester: true,
                    isShopifyStore: true,
                })
            )

            expect(result.current).toStrictEqual(TRIGGER_LIST)
        })
    })
})
