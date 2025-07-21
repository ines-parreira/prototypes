import { AttachmentEnum } from 'common/types'
import { campaignWithABGroup } from 'fixtures/abGroup'
import {
    campaign,
    campaignProductRecommendationAttachment,
} from 'fixtures/campaign'

import {
    CONTAINS_DISCOUNT_CODES,
    CONTAINS_PRODUCT_CARDS,
    TRIGGERED_ON_EXIT_INTENT,
} from '../../constants/filters'
import { Campaign } from '../../types/Campaign'
import { ABGroupStatus } from '../../types/enums/ABGroupStatus.enum'
import { CampaignStatus } from '../../types/enums/CampaignStatus.enum'
import { CampaignTriggerBusinessHoursValuesEnum } from '../../types/enums/CampaignTriggerBusinessHoursValues.enum'
import { CampaignTriggerOperator } from '../../types/enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from '../../types/enums/CampaignTriggerType.enum'
import { createTrigger } from '../createTrigger'
import {
    filterWithABTests,
    filterWithDiscountCodes,
    filterWithExitIntent,
    filterWithOutsideBusinessHours,
    filterWithProductCards,
    quickFiltersInvoke,
} from '../filters'

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
            name: 'product 1',
            contentType: AttachmentEnum.Product,
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

const campaignThree: Campaign = {
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
            value: CampaignTriggerBusinessHoursValuesEnum.During,
        },
    ],
    attachments: [campaignProductRecommendationAttachment],
    status: CampaignStatus.Active,
}

const campaignFour: Campaign = {
    ...campaign,
    status: CampaignStatus.Active,
    id: '4',
    name: 'Campaign with discount offer',
    triggers: [createTrigger(CampaignTriggerType.CurrentUrl)],
    attachments: [
        {
            contentType: AttachmentEnum.DiscountOffer,
            name: 'offer',
            extra: {
                discount_offer_id: '3',
                summary: 'test',
            },
        },
    ],
}
const campaignFive: Campaign = {
    ...campaign,
    status: CampaignStatus.Active,
    id: '5',
    name: 'Campaign with discount offer and product card',
    triggers: [createTrigger(CampaignTriggerType.CurrentUrl)],
    attachments: [
        {
            contentType: AttachmentEnum.DiscountOffer,
            name: 'offer',
            extra: {
                discount_offer_id: '3',
                summary: 'test',
            },
        },
        {
            name: 'product 1',
            contentType: AttachmentEnum.Product,
            size: 0,
            extra: {
                price: 0,
                product_link: '',
                product_id: 0,
            },
        },
    ],
}

const campaignWithABTest: Campaign = {
    ...campaignWithABGroup,
    status: CampaignStatus.Active,
    ab_group: {
        ...campaignWithABGroup,
        status: ABGroupStatus.Draft,
    },
    variants: [],
    triggers: [],
}

describe('filterWithProductCards()', () => {
    it('should return campaigns with product cards', () => {
        expect(
            filterWithProductCards([
                campaignOne,
                campaignTwo,
                campaignThree,
                campaignFive,
            ]),
        ).toEqual([campaignOne, campaignThree, campaignFive])
    })

    it('should return empty array if no campaigns with product cards', () => {
        expect(filterWithProductCards([campaignTwo])).toEqual([])
    })
})

describe('filterWithDiscountCodes()', () => {
    it('should return campaigns with discount codes', () => {
        expect(
            filterWithDiscountCodes([
                campaignOne,
                campaignTwo,
                campaignFour,
                campaignFive,
            ]),
        ).toEqual([campaignOne, campaignFour, campaignFive])
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
            filterWithOutsideBusinessHours([
                campaignOne,
                campaignTwo,
                campaignThree,
            ]),
        ).toEqual([campaignOne, campaignTwo])
    })

    it('should return empty array if no campaigns with outside business hours', () => {
        expect(filterWithOutsideBusinessHours([campaignThree])).toEqual([])
    })
})

describe('filterWithABTests', () => {
    it('should return campanies with A/B test', () => {
        expect(filterWithABTests([campaignTwo, campaignWithABTest])).toEqual([
            campaignWithABTest,
        ])
    })

    it('should return empty array if no campaigns with A/B Tests', () => {
        expect(filterWithABTests([campaignThree])).toEqual([])
    })
})

describe('quickFiltersInvoke()', () => {
    it('filters campaigns based on selected quick filters', () => {
        expect(
            quickFiltersInvoke(
                [campaignOne, campaignTwo],
                [CONTAINS_PRODUCT_CARDS.id, CONTAINS_DISCOUNT_CODES.id],
            ),
        ).toEqual([campaignOne])

        expect(
            quickFiltersInvoke(
                [campaignOne, campaignTwo],
                [TRIGGERED_ON_EXIT_INTENT.id],
            ),
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
