import {AttachmentEnum} from 'common/types'
import {
    CampaignPreview,
    InferredCampaignStatus,
} from 'models/convert/campaign/types'
import {
    CampaignDiscountOfferAttachment,
    CampaignProductAttachment,
    CampaignProductRecommendation,
    ProductRecommendationScenario,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'
import {ScheduleSchema} from 'pages/convert/campaigns/types/CampaignSchedule'
import {ABGroupStatus} from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignScheduleRuleValueEnum} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'

import {Components} from 'rest_api/revenue_addon_api/client.generated'

export const campaignId = 'ee869594-65e2-45a5-a759-a4660c9ce677'

export const triggerId = '476ce50d-ac6f-4553-8400-b7ae0aad70c2'

export const campaignTrigger = {
    id: triggerId,
    type: CampaignTriggerType.TimeSpentOnPage,
    operator: CampaignTriggerOperator.Gt,
    value: 10,
}

export const campaignVariant: CampaignVariant = {
    id: '01GWQ5K143AN1Y3W0AYBZXCGPT',
    message_text: 'Hello variant 1!',
    message_html: '<b>Hello variant 1</b>.',
    attachments: [],
}

const campaignVariants = [
    {
        id: '01GWQ5K143AN1Y3W0AYBZXCGPV',
        message_text: 'Hello variant 2!',
        message_html: '<b>Hello variant 2</b>.',
        attachments: [],
    },
    {
        id: '01GWQ5K143AN1Y3W0AYBZXCGPW',
        message_text: 'Hello variant 3!',
        message_html: '<b>Hello variant 3</b>.',
        attachments: [],
    },
    {
        id: '01GWQ5K143AN1Y3W0AYBZXCGPX',
        message_text: 'Hello variant 4!',
        message_html: '<b>Hello variant 4</b>.',
        attachments: [],
    },
    {
        id: '01GWQ5K143AN1Y3W0AYBZXCGPY',
        message_text: 'Hello variant 5!',
        message_html: '<b>Hello variant 5</b>.',
        attachments: [],
    },
]

const campaignTriggers: Components.Schemas.CampaignTriggerSchema[] = [
    {
        type: CampaignTriggerType.TimeSpentOnPage,
        operator: CampaignTriggerOperator.Gt,
        value: 30,
        id: 'trigger-1',
    },
    {
        type: CampaignTriggerType.CurrentUrl,
        operator: CampaignTriggerOperator.Contains,
        value: 'product',
        id: 'trigger-2',
    },
    {
        type: CampaignTriggerType.BusinessHours,
        operator: CampaignTriggerOperator.Eq,
        value: true,
        id: 'trigger-3',
    },
    {
        type: CampaignTriggerType.CartValue,
        operator: CampaignTriggerOperator.Gte,
        value: 100,
        id: 'trigger-4',
    },
    {
        type: CampaignTriggerType.ExitIntent,
        operator: CampaignTriggerOperator.StartsWith,
        value: 'https://example.com',
        id: 'trigger-5',
    },
]

const abGroups = [
    {
        winner_variant_id: 'variant-1',
        status: ABGroupStatus.Started,
        started_datetime: '2022-01-01T12:00:00Z',
        stopped_datetime: null,
        campaign_id: 'campaign-1',
    },
    {
        winner_variant_id: null,
        status: ABGroupStatus.Draft,
        started_datetime: null,
        stopped_datetime: null,
        campaign_id: 'campaign-2',
    },
    {
        winner_variant_id: 'variant-3',
        status: ABGroupStatus.Completed,
        started_datetime: '2022-01-01T12:00:00Z',
        stopped_datetime: '2022-01-01T13:00:00Z',
        campaign_id: 'campaign-3',
    },
    {
        winner_variant_id: 'variant-4',
        status: ABGroupStatus.Paused,
        started_datetime: '2022-01-01T12:00:00Z',
        stopped_datetime: null,
        campaign_id: 'campaign-4',
    },
    {
        winner_variant_id: null,
        status: ABGroupStatus.Started,
        started_datetime: '2022-01-01T12:00:00Z',
        stopped_datetime: null,
        campaign_id: null,
    },
]

export const campaign = {
    id: campaignId,
    name: 'Welcome to the internet',
    description: 'A campaign to welcome people to the internet',
    message_text: 'Hello, please enjoy your stay on the internet.',
    message_html: 'Hello, please enjoy your stay on the <b>internet</b>.',
    language: 'en-US',
    status: 'active',
    is_light: false,
    trigger_rule: `{${triggerId}}`,
    attachments: [],
    meta: {
        delay: null,
        noReply: null,
        agentName: null,
        agentAvatarUrl: null,
        agentEmail: null,
    },
    triggers: [campaignTrigger],
    variants: [campaignVariant],
    created_datetime: '2024-02-16T09:57:44.284000',
    updated_datetime: '2024-02-16T09:57:56.352370',
    deleted_datetime: null,
    template_id: null,
}

export const campaignsList: CampaignPreview[] = [
    {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Summer Sale',
        status: InferredCampaignStatus.Active,
        is_light: true,
        variants: [campaignVariants[0]],
        ab_group: abGroups[0],
    },
    {
        id: '23456789-0123-4567-8901-234567890123',
        name: 'New Year Offer',
        status: InferredCampaignStatus.Inactive,
        is_light: false,
        variants: [campaignVariants[1]],
        ab_group: abGroups[1],
    },
    {
        id: '34567890-1234-5678-9012-345678901234',
        name: 'Welcome Back',
        status: InferredCampaignStatus.Active,
        is_light: true,
        variants: [campaignVariants[2]],
        ab_group: abGroups[2],
    },
    {
        id: '45678901-2345-6789-0123-456789012345',
        name: 'Birthday Offer',
        status: InferredCampaignStatus.Inactive,
        is_light: false,
        variants: [campaignVariants[3]],
        ab_group: abGroups[3],
    },
    {
        id: '56789012-3456-7890-1234-567890123456',
        name: 'Anniversary Offer',
        status: InferredCampaignStatus.Active,
        is_light: true,
        variants: [campaignVariants[4]],
        ab_group: abGroups[4],
    },
]

export const campaignProductAttachment = {
    url: 'https://athlete-shift.com/products/thick-socks',
    name: 'Thick socks',
    contentType: AttachmentEnum.Product,
    size: 44,
    extra: {
        price: 12.34,
        currency: 'USD',
        product_link: 'https://athlete-shift.com/products/thick-socks-heart',
        product_id: 349348782,
        variant_name: 'Thick socks with heart',
    },
} as CampaignProductAttachment

export const campaignDiscountOfferAttachment = {
    contentType: AttachmentEnum.DiscountOffer,
    name: '10% off',
    extra: {
        discount_offer_id: '10OFF',
        summary: '10% off for everyone',
    },
} as CampaignDiscountOfferAttachment

export const campaignProductRecommendationAttachment = {
    contentType: AttachmentEnum.ProductRecommendation,
    name: 'Similar Browsed Products',
    extra: {
        id: '01J4VH71YJ704QXCP4WDST3ZT3',
        scenario: ProductRecommendationScenario.SimilarSeen,
    },
} as CampaignProductRecommendation

export const campaignSchedule = {
    custom_schedule: null,
    start_datetime: '2024-02-16T09:57:44.284000',
    end_datetime: null,
    schedule_rule: CampaignScheduleRuleValueEnum.AllDay,
} as ScheduleSchema

export const campaignsResponseData: Components.Schemas.CampaignResponseSchema[] =
    [
        {
            id: '123e4567-e89b-12d3-a456-426614174000',
            is_light: true,
            created_datetime: '2024-02-16T09:57:44.284000',
            updated_datetime: '2024-02-17T09:57:56.352370',
            name: 'Campaign 1',
            description: 'This is the first campaign',
            message_text: 'Hello, world!',
            message_html: '<p>Hello, world!</p>',
            language: 'en',
            status: 'active',
            trigger_rule: 'rule1',
            attachments: null,
            meta: {
                key: 'value',
            },
            triggers: [campaignTriggers[0]],
            variants: [
                {
                    message_text: 'CampaignVariantRequestSchema',
                    id: '1',
                },
            ],
            template_id: 'template1',
        },
        {
            id: '123e4567-e89b-12d3-a456-426614174001',
            is_light: false,
            created_datetime: '2024-02-17T09:57:44.284000',
            updated_datetime: '2024-02-18T09:57:56.352370',
            name: 'Campaign 2',
            description: 'This is the second campaign',
            message_text: 'Hello, world!',
            message_html: '<p>Hello, world!</p>',
            language: 'fr',
            status: 'inactive',
            trigger_rule: 'rule2',
            attachments: null,
            meta: {
                key: 'value',
            },
            triggers: [campaignTriggers[1]],
            variants: [
                {
                    message_text: 'CampaignVariantRequestSchema',
                    id: '2',
                },
            ],
            template_id: 'template2',
        },
        {
            id: '123e4567-e89b-12d3-a456-426614174003',
            is_light: false,
            created_datetime: '2024-02-18T09:57:44.284000',
            updated_datetime: '2024-02-19T09:57:56.352370',
            name: 'Campaign 3',
            description: 'This is the third campaign',
            message_text: 'Hello, world!',
            message_html: '<p>Hello, world!</p>',
            language: 'es',
            status: 'active',
            trigger_rule: 'rule3',
            attachments: null,
            meta: {
                key: 'value',
            },
            triggers: [campaignTriggers[2]],
            variants: [
                {
                    message_text: 'CampaignVariantRequestSchema',
                    id: '3',
                },
            ],
            template_id: 'template3',
        },
        {
            id: '123e4567-e89b-12d3-a456-426614174004',
            is_light: true,
            created_datetime: '2024-02-18T09:57:44.284000',
            updated_datetime: '2024-02-19T09:57:56.352370',
            name: 'Campaign 4',
            description: 'This is the fourth campaign',
            message_text: 'Hello, world!',
            message_html: '<p>Hello, world!</p>',
            language: 'de',
            status: 'inactive',
            trigger_rule: 'rule4',
            attachments: null,
            meta: {
                key: 'value',
            },
            triggers: [campaignTriggers[3]],
            variants: [
                {
                    message_text: 'CampaignVariantRequestSchema',
                    id: '4',
                },
            ],
            template_id: 'template4',
        },
        {
            id: '123e4567-e89b-12d3-a456-426614174005',
            is_light: true,
            created_datetime: '2024-02-19T09:57:44.284000',
            updated_datetime: '2024-02-20T09:57:56.352370',
            name: 'Campaign 5',
            description: 'This is the fifth campaign',
            message_text: 'Hello, world!',
            message_html: '<p>Hello, world!</p>',
            language: 'it',
            status: 'active',
            trigger_rule: 'rule5',
            attachments: null,
            meta: {
                key: 'value',
            },
            triggers: [campaignTriggers[4]],
            variants: [
                {
                    message_text: 'CampaignVariantRequestSchema',
                    id: '5',
                },
            ],
            template_id: 'template5',
        },
    ]
