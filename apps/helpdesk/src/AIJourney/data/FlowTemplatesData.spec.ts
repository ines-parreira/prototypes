import { JourneyTypeEnum } from '@gorgias/convert-client'

import {
    FlowTemplatesData,
    getTemplateForJourneyType,
} from './FlowTemplatesData'

describe('getTemplateForJourneyType', () => {
    it.each([
        JourneyTypeEnum.Welcome,
        JourneyTypeEnum.CartAbandoned,
        JourneyTypeEnum.SessionAbandoned,
        JourneyTypeEnum.PostPurchase,
        JourneyTypeEnum.WinBack,
    ])('returns a template for %s', (journeyType) => {
        const template = getTemplateForJourneyType(journeyType)
        expect(template).toBeDefined()
        expect(template?.name).toEqual(expect.any(String))
        // Content is null until the canonical copy is delivered.
        expect(template?.content).toBeNull()
    })

    it('returns undefined for campaigns (handled by the picker, not auto-applied)', () => {
        expect(
            getTemplateForJourneyType(JourneyTypeEnum.Campaign),
        ).toBeUndefined()
    })

    it('returns undefined for custom flows (no template)', () => {
        expect(
            getTemplateForJourneyType(JourneyTypeEnum.Custom),
        ).toBeUndefined()
    })

    it('returns undefined when journeyType is undefined', () => {
        expect(getTemplateForJourneyType(undefined)).toBeUndefined()
    })

    it('exposes the same template via FlowTemplatesData record', () => {
        expect(getTemplateForJourneyType(JourneyTypeEnum.Welcome)).toBe(
            FlowTemplatesData[JourneyTypeEnum.Welcome],
        )
    })
})
