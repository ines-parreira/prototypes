import {renderHook} from 'react-hooks-testing-library'

import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'
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
                    defaults: {value: '/', operator: 'eq'},
                    requirements: {},
                },
                {
                    key: CampaignTriggerKey.TimeSpentOnPage,
                    label: 'Time spent on page',
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
                    defaults: {value: '/', operator: 'eq'},
                    requirements: {},
                },
                {
                    key: CampaignTriggerKey.TimeSpentOnPage,
                    label: 'Time spent on page',
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
                    key: CampaignTriggerKey.BusinessHours,
                    label: 'Business hours',
                    defaults: {value: true, operator: 'during'},
                    requirements: {revenue: true},
                },
                {
                    key: CampaignTriggerKey.CurrentUrl,
                    label: 'Current URL',
                    defaults: {value: '/', operator: 'eq'},
                    requirements: {},
                },
                {
                    key: CampaignTriggerKey.TimeSpentOnPage,
                    label: 'Time spent on page',
                    defaults: {value: 0, operator: 'gt'},
                    requirements: {},
                },
                {
                    key: CampaignTriggerKey.VisitCount,
                    label: 'Number of visits',
                    defaults: {value: 0, operator: 'gt'},
                    requirements: {
                        revenue: true,
                    },
                },
                {
                    key: CampaignTriggerKey.SessionTime,
                    label: 'Time spent per visit',
                    defaults: {
                        value: 0,
                        operator: SessionTimeOperators.GreaterThan,
                    },
                    requirements: {
                        revenue: true,
                    },
                },
            ])
        })
    })

    describe.skip('Merchant IS a revenue subscriber and HAS a Shopify chat', () => {
        // To be implemented
    })
})
