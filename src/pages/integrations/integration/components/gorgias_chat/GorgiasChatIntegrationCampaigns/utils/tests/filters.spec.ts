import {ChatCampaign} from '../../types/Campaign'
import {BusinessHoursOperators} from '../../types/enums/BusinessHoursOperators.enum'
import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'

import {
    filterWithAttachments,
    filterWithDiscountCodes,
    filterWithExitIntent,
    filterWithOutsideBusinessHours,
    quickFiltersInvoke,
} from '../filters'

import {createTrigger} from '../createTrigger'
import {
    CONTAINS_PRODUCT_CARDS,
    CONTAINS_DISCOUNT_CODES,
    TRIGGERED_ON_EXIT_INTENT,
} from '../../constants/filters'

const campaignOne: ChatCampaign = {
    id: '1',
    name: 'Campaign 1',
    message: {
        text: 'code',
        html: '<a data-discount-code="code">code</a>',
    },
    triggers: [
        createTrigger(CampaignTriggerKey.ExitIntent),
        createTrigger(CampaignTriggerKey.BusinessHours),
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
}

const campaignTwo: ChatCampaign = {
    id: '2',
    name: 'Campaign 2',
    message: {
        text: 'something',
        html: 'something',
    },
    triggers: [
        {
            key: CampaignTriggerKey.BusinessHours,
            operator: BusinessHoursOperators.Anytime,
            value: '',
        },
    ],
    attachments: [],
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
