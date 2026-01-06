import { JourneyTypeEnum } from '@gorgias/convert-client'

export const STEPS_NAMES = {
    SETUP: 'setup',
    TEST: 'test',
    ACTIVATE: 'activate',
}

export const JOURNEY_TYPES = {
    CAMPAIGN: 'campaign',
    CART_ABANDONMENT: 'cart-abandoned',
    POST_PURCHASE: 'post-purchase',
    SESSION_ABANDONMENT: 'session-abandoned',
    WELCOME: 'welcome',
    WIN_BACK: 'win-back',
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
