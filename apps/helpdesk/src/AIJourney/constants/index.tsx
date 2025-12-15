import { JourneyTypeEnum } from '@gorgias/convert-client'

export const STEPS_NAMES = {
    SETUP: 'setup',
    TEST: 'test',
    ACTIVATE: 'activate',
}

export const JOURNEY_TYPES = {
    CART_ABANDONMENT: 'cart-abandoned',
    SESSION_ABANDONMENT: 'session-abandoned',
    CAMPAIGN: 'campaign',
    WIN_BACK: 'win-back',
    WELCOME: 'welcome',
}

export type JOURNEY_TYPES = (typeof JOURNEY_TYPES)[keyof typeof JOURNEY_TYPES]

export const JOURNEY_COMPLETE_REASON = {
    OPTED_OUT: 'Eligibility::Shopper Opted Out',
}

export const JOURNEY_TYPES_MAP_TO_URL: Record<JourneyTypeEnum, JOURNEY_TYPES> =
    {
        [JourneyTypeEnum.CartAbandoned]: JOURNEY_TYPES.CART_ABANDONMENT,
        [JourneyTypeEnum.SessionAbandoned]: JOURNEY_TYPES.SESSION_ABANDONMENT,
        [JourneyTypeEnum.Campaign]: JOURNEY_TYPES.CAMPAIGN,
        [JourneyTypeEnum.WinBack]: JOURNEY_TYPES.WIN_BACK,
    }

export const JOURNEY_TYPE_MAP_TO_STRING: Record<JourneyTypeEnum, string> = {
    [JourneyTypeEnum.CartAbandoned]: 'Cart Abandoned',
    [JourneyTypeEnum.SessionAbandoned]: 'Browse Abandoned',
    [JourneyTypeEnum.Campaign]: 'Campaign',
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
