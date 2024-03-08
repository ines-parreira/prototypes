import {campaign} from 'fixtures/campaign'
import {Campaign} from '../../types/Campaign'

import {
    filterWithAttachments,
    filterWithDiscountCodes,
    filterWithExitIntent,
    filterWithOutsideBusinessHours,
    quickFiltersInvoke,
} from '../filters'

import {createTrigger} from '../createTrigger'
import {
    CONTAINS_DISCOUNT_CODES,
    CONTAINS_PRODUCT_CARDS,
    TRIGGERED_ON_EXIT_INTENT,
} from '../../constants/filters'
import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'
import {CampaignTriggerBusinessHoursValuesEnum} from '../../types/enums/CampaignTriggerBusinessHoursValues.enum'
import {CampaignTriggerOperator} from '../../types/enums/CampaignTriggerOperator.enum'
import {CampaignStatus} from '../../types/enums/CampaignStatus.enum'

const campaignOne: Campaign = {
    ...campaign,
    id: '1',
    name: 'Campaign 1',
    message_text: 'code',
    message_html: '<a data-discount-code="code">code</a>',
    triggers: [
        createTrigger(CampaignTriggerType.ExitIntent),
        createTrigger(CampaignTriggerType.BusinessHours),
    ],
    attachments: [
        {
            name: 'Attachment 1',
            contentType: 'image',
            size: 0,
            extra: {
                price: 0,
                product_link: '',
                product_id: 0,
            },
        },
    ],
    status: CampaignStatus.Active,
}

const campaignTwo: Campaign = {
    ...campaign,
    id: '2',
    name: 'Campaign 2',
    message_text: 'something',
    message_html: 'something',
    triggers: [
        {
            id: '1',
            type: CampaignTriggerType.BusinessHours,
            operator: CampaignTriggerOperator.Eq,
            value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
        },
    ],
    attachments: [],
    status: CampaignStatus.Active,
}

describe('filterWithAttachments()', () => {
    it('should return campaigns with attachments', () => {
        expect(filterWithAttachments([campaignOne, campaignTwo])).toEqual([
            campaignOne,
        ])
    })

    it('should return empty array if no campaigns with attachments', () => {
        expect(filterWithAttachments([campaignTwo])).toEqual([])
    })
})

describe('filterWithDiscountCodes()', () => {
    it('should return campaigns with discount codes', () => {
        expect(filterWithDiscountCodes([campaignOne, campaignTwo])).toEqual([
            campaignOne,
        ])
    })

    it('should return empty array if no campaigns with discount codes', () => {
        expect(filterWithDiscountCodes([campaignTwo])).toEqual([])
    })
})

describe('filterWithExitIntent()', () => {
    it('should return campaigns with exit intent', () => {
        expect(filterWithExitIntent([campaignOne, campaignTwo])).toEqual([
            campaignOne,
        ])
    })

    it('should return empty array if no campaigns with exit intent', () => {
        expect(filterWithExitIntent([campaignTwo])).toEqual([])
    })
})

describe('filterWithOutsideBusinessHours()', () => {
    it('should return campaigns with outside business hours', () => {
        expect(
            filterWithOutsideBusinessHours([campaignOne, campaignTwo])
        ).toEqual([campaignTwo])
    })

    it('should return empty array if no campaigns with outside business hours', () => {
        expect(filterWithOutsideBusinessHours([campaignOne])).toEqual([])
    })
})

describe('quickFiltersInvoke()', () => {
    it('filters campaigns based on selected quick filters', () => {
        expect(
            quickFiltersInvoke(
                [campaignOne, campaignTwo],
                [CONTAINS_PRODUCT_CARDS.id, CONTAINS_DISCOUNT_CODES.id]
            )
        ).toEqual([campaignOne])

        expect(
            quickFiltersInvoke(
                [campaignOne, campaignTwo],
                [TRIGGERED_ON_EXIT_INTENT.id]
            )
        ).toEqual([campaignOne])
    })

    it('returns all campaigns if no quick filters selected', () => {
        expect(quickFiltersInvoke([campaignOne, campaignTwo], [])).toEqual([
            campaignOne,
            campaignTwo,
        ])
    })

    it('returns empty array if no campaigns', () => {
        expect(quickFiltersInvoke([], [])).toEqual([])
    })
})
