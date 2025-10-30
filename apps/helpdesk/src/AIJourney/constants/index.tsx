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
}

export const JOURNEY_COMPLETE_REASON = {
    OPTED_OUT: 'Eligibility::Shopper Opted Out',
}

export const JOURNEY_TYPES_MAP_TO_URL: Record<JourneyTypeEnum, string> = {
    [JourneyTypeEnum.CartAbandoned]: JOURNEY_TYPES.CART_ABANDONMENT,
    [JourneyTypeEnum.SessionAbandoned]: JOURNEY_TYPES.SESSION_ABANDONMENT,
    [JourneyTypeEnum.Campaign]: JOURNEY_TYPES.CAMPAIGN,
}

export const JOURNEY_TYPES_MAP_TO_STRING: Record<JourneyTypeEnum, string> = {
    [JourneyTypeEnum.CartAbandoned]: 'Cart Abandoned',
    [JourneyTypeEnum.SessionAbandoned]: 'Browse Abandoned',
    [JourneyTypeEnum.Campaign]: 'Campaign',
}
