import {
    CONVERT_LIGHT_TRIGGERS,
    TRIGGERS_CONFIG,
} from 'pages/convert/campaigns/constants/triggers'
import { renderHook } from 'utils/testing/renderHook'

import { CampaignTriggerType } from '../../types/enums/CampaignTriggerType.enum'
import { useAvailableTriggerList } from '../useAvailableTriggerList'

describe('useAvailableTriggerList()', () => {
    describe('Merchant IS NOT a revenue subscriber and DOES NOT HAVE a Shopify chat', () => {
        it('returns only legacy triggers', () => {
            const { result } = renderHook(() =>
                useAvailableTriggerList({
                    isConvertSubscriber: false,
                    isShopifyStore: false,
                }),
            )

            expect(Object.keys(result.current)).toStrictEqual([
                CampaignTriggerType.CurrentUrl,
                CampaignTriggerType.TimeSpentOnPage,
            ])

            expect(Object.values(result.current)).toStrictEqual([
                TRIGGERS_CONFIG[CampaignTriggerType.CurrentUrl],
                TRIGGERS_CONFIG[CampaignTriggerType.TimeSpentOnPage],
            ])
        })
    })

    describe('Merchant IS NOT a revenue subscriber and HAS a Shopify chat', () => {
        it('returns legacy triggers', () => {
            const { result } = renderHook(() =>
                useAvailableTriggerList({
                    isConvertSubscriber: false,
                    isShopifyStore: true,
                }),
            )

            expect(Object.keys(result.current)).toStrictEqual([
                CampaignTriggerType.CurrentUrl,
                CampaignTriggerType.TimeSpentOnPage,
            ])

            expect(Object.values(result.current)).toStrictEqual([
                TRIGGERS_CONFIG[CampaignTriggerType.CurrentUrl],
                TRIGGERS_CONFIG[CampaignTriggerType.TimeSpentOnPage],
            ])
        })
    })

    describe('Merchant IS a revenue subscriber and DOES NOT HAVE a Shopify chat', () => {
        it('returns both legacy and advanced (non Shopify) triggers', () => {
            const { result } = renderHook(() =>
                useAvailableTriggerList({
                    isConvertSubscriber: true,
                    isShopifyStore: false,
                }),
            )

            expect(Object.keys(result.current)).toStrictEqual([
                CampaignTriggerType.CurrentUrl,
                CampaignTriggerType.TimeSpentOnPage,
                CampaignTriggerType.VisitCount,
                CampaignTriggerType.SessionTime,
                CampaignTriggerType.ExitIntent,
                CampaignTriggerType.BusinessHours,
            ])

            expect(Object.values(result.current)).toStrictEqual([
                TRIGGERS_CONFIG[CampaignTriggerType.CurrentUrl],
                TRIGGERS_CONFIG[CampaignTriggerType.TimeSpentOnPage],
                TRIGGERS_CONFIG[CampaignTriggerType.VisitCount],
                TRIGGERS_CONFIG[CampaignTriggerType.SessionTime],
                TRIGGERS_CONFIG[CampaignTriggerType.ExitIntent],
                TRIGGERS_CONFIG[CampaignTriggerType.BusinessHours],
            ])
        })
    })

    describe('Merchant IS a revenue subscriber and HAS a Shopify chat', () => {
        it('returns all triggers except hidden', () => {
            const { result } = renderHook(() =>
                useAvailableTriggerList({
                    isConvertSubscriber: true,
                    isShopifyStore: true,
                }),
            )

            const {
                [CampaignTriggerType.SingleInView]: ___,
                [CampaignTriggerType.DeviceType]: __,
                [CampaignTriggerType.IncognitoVisitor]: ____,
                ...expected
            } = TRIGGERS_CONFIG

            expect(result.current).toStrictEqual(expected)
        })
    })

    describe('Merchant IS a Convert subscriber and HAS a Shopify chat and IS light campaign', () => {
        it('returns only light campaign triggers', () => {
            const { result } = renderHook(() =>
                useAvailableTriggerList({
                    isConvertSubscriber: true,
                    isShopifyStore: true,
                    isLightCampaign: true,
                }),
            )

            const expected = {
                [CONVERT_LIGHT_TRIGGERS[0]]:
                    TRIGGERS_CONFIG[CONVERT_LIGHT_TRIGGERS[0]],
                [CONVERT_LIGHT_TRIGGERS[1]]:
                    TRIGGERS_CONFIG[CONVERT_LIGHT_TRIGGERS[1]],
            }

            expect(result.current).toStrictEqual(expected)
        })
    })
})
