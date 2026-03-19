import moment from 'moment'

import { JourneyTypeEnum } from '@gorgias/convert-client'

export const STEPS_NAMES = {
    SETUP: 'setup',
    PREVIEW: 'preview',
    ACTIVATE: 'activate',
}

export type STEPS_NAMES = (typeof STEPS_NAMES)[keyof typeof STEPS_NAMES]

export const CAMPAIGN_TYPE = 'campaign'

export const FLOW_TYPES = {
    CART_ABANDONMENT: 'cart-abandoned',
    POST_PURCHASE: 'post-purchase',
    SESSION_ABANDONMENT: 'session-abandoned',
    WELCOME: 'welcome',
    WIN_BACK: 'win-back',
}

export const JOURNEY_TYPES = {
    CAMPAIGN: CAMPAIGN_TYPE,
    ...FLOW_TYPES,
} as const

export type JOURNEY_TYPES = (typeof JOURNEY_TYPES)[keyof typeof JOURNEY_TYPES]

export const JOURNEY_COMPLETE_REASON = {
    OPTED_OUT: 'Eligibility::Shopper Opted Out',
}

export const JOURNEY_TYPES_MAP_TO_URL: Record<JourneyTypeEnum, JOURNEY_TYPES> =
    {
        [JourneyTypeEnum.Campaign]: JOURNEY_TYPES.CAMPAIGN,
        [JourneyTypeEnum.CartAbandoned]: JOURNEY_TYPES.CART_ABANDONMENT,
        [JourneyTypeEnum.PostPurchase]: JOURNEY_TYPES.POST_PURCHASE,
        [JourneyTypeEnum.SessionAbandoned]: JOURNEY_TYPES.SESSION_ABANDONMENT,
        [JourneyTypeEnum.Welcome]: JOURNEY_TYPES.WELCOME,
        [JourneyTypeEnum.WinBack]: JOURNEY_TYPES.WIN_BACK,
    }

export const JOURNEY_TYPE_MAP_TO_STRING: Record<JourneyTypeEnum, string> = {
    [JourneyTypeEnum.Campaign]: 'Campaign',
    [JourneyTypeEnum.CartAbandoned]: 'Cart Abandoned',
    [JourneyTypeEnum.PostPurchase]: 'Post-purchase',
    [JourneyTypeEnum.SessionAbandoned]: 'Browse Abandoned',
    [JourneyTypeEnum.Welcome]: 'Welcome',
    [JourneyTypeEnum.WinBack]: 'Customer Win-back',
}

export const JOURNEY_TYPE_MAP_FROM_URL = Object.fromEntries(
    Object.entries(JOURNEY_TYPES_MAP_TO_URL).map(([key, value]) => [
        value,
        key,
    ]),
) as Record<JOURNEY_TYPES, JourneyTypeEnum>

export type UpdatableJourneyCampaignState =
    (typeof UpdatableJourneyCampaignState)[keyof typeof UpdatableJourneyCampaignState]

export const UpdatableJourneyCampaignState = {
    Draft: 'draft',
    Scheduled: 'scheduled',
    Canceled: 'canceled',
    Paused: 'paused',
}

export const MAX_WAIT_TIME = moment.duration(7, 'days').asMinutes()

export const JOURNEY_ONBOARDING_STEPS = [
    {
        name: STEPS_NAMES.SETUP,
        label: 'Setup',
        stepNumber: 1,
    },
    {
        name: STEPS_NAMES.PREVIEW,
        label: 'Preview',
        stepNumber: 2,
    },
    {
        name: STEPS_NAMES.ACTIVATE,
        label: 'Test and activate',
        stepNumber: 3,
    },
]

export const SANKEY_ENGAGEMENT_CATEGORY = {
    REPLIED_AND_CLICKED: 'replied_and_clicked',
    REPLIED_ONLY: 'replied_only',
    CLICKED_NO_REPLY: 'clicked_no_reply',
    NO_ENGAGEMENT: 'no_engagement',
    REPLIED_AND_USED_DISCOUNT: 'replied_and_used_discount',
    USED_DISCOUNT_NO_REPLY: 'used_discount_no_reply',
} as const

export const SANKEY_NODES_NAMES = {
    CONVERSATIONS: 'Conversations',
    REPLIED_AND_USED_DISCOUNT: 'Replied + used discount',
    REPLIED_AND_CLICKED: 'Replied + clicked',
    REPLIED_ONLY: 'Replied only',
    USED_DISCOUNT_NO_REPLY: 'Used discount (no reply)',
    CLICKED_NO_REPLY: 'Clicked (no reply)',
    NO_ENGAGEMENT: 'No engagement',
    CONVERTED: 'Converted',
    NOT_CONVERTED: 'Not converted',
} as const

export type SankeyNodeName =
    (typeof SANKEY_NODES_NAMES)[keyof typeof SANKEY_NODES_NAMES]

export const SANKEY_NODE_TO_ENGAGEMENT_CATEGORY: Partial<
    Record<SankeyNodeName, string>
> = {
    [SANKEY_NODES_NAMES.REPLIED_AND_USED_DISCOUNT]:
        SANKEY_ENGAGEMENT_CATEGORY.REPLIED_AND_USED_DISCOUNT,
    [SANKEY_NODES_NAMES.REPLIED_AND_CLICKED]:
        SANKEY_ENGAGEMENT_CATEGORY.REPLIED_AND_CLICKED,
    [SANKEY_NODES_NAMES.REPLIED_ONLY]: SANKEY_ENGAGEMENT_CATEGORY.REPLIED_ONLY,
    [SANKEY_NODES_NAMES.USED_DISCOUNT_NO_REPLY]:
        SANKEY_ENGAGEMENT_CATEGORY.USED_DISCOUNT_NO_REPLY,
    [SANKEY_NODES_NAMES.CLICKED_NO_REPLY]:
        SANKEY_ENGAGEMENT_CATEGORY.CLICKED_NO_REPLY,
    [SANKEY_NODES_NAMES.NO_ENGAGEMENT]:
        SANKEY_ENGAGEMENT_CATEGORY.NO_ENGAGEMENT,
}
