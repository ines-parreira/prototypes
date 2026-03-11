import { Activation } from 'AIJourney/pages/Activation/Activation'
import { Preview } from 'AIJourney/pages/Preview/Preview'
import { Setup } from 'AIJourney/pages/Setup/Setup'

import { JOURNEY_TYPES, STEPS_NAMES } from '.'

const DEFAULT_STEPS = [
    {
        stepName: STEPS_NAMES.SETUP,
        component: Setup,
    },
    {
        stepName: STEPS_NAMES.PREVIEW,
        component: Preview,
    },
    {
        stepName: STEPS_NAMES.ACTIVATE,
        component: Activation,
    },
]

export const CART_ABANDONMENT_STEPS = {
    journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
    steps: DEFAULT_STEPS,
}

export const SESSION_ABANDONMENT_STEPS = {
    journeyType: JOURNEY_TYPES.SESSION_ABANDONMENT,
    steps: DEFAULT_STEPS,
}

export const CAMPAIGN_STEPS = {
    journeyType: JOURNEY_TYPES.CAMPAIGN,
    steps: DEFAULT_STEPS,
}

export const WIN_BACK_STEPS = {
    journeyType: JOURNEY_TYPES.WIN_BACK,
    steps: DEFAULT_STEPS,
}

export const WELCOME_STEPS = {
    journeyType: JOURNEY_TYPES.WELCOME,
    steps: DEFAULT_STEPS,
}

export const POST_PURCHASE_STEPS = {
    journeyType: JOURNEY_TYPES.POST_PURCHASE,
    steps: DEFAULT_STEPS,
}

export const AI_JOURNEY_ONBOARDING_STEPS = [
    CART_ABANDONMENT_STEPS,
    SESSION_ABANDONMENT_STEPS,
    CAMPAIGN_STEPS,
    WIN_BACK_STEPS,
    WELCOME_STEPS,
    POST_PURCHASE_STEPS,
]
