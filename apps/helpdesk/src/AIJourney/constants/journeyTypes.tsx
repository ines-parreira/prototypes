import { Activation } from 'AIJourney/pages/Activation/Activation'
import { Setup } from 'AIJourney/pages/Setup/Setup'
import { Test } from 'AIJourney/pages/Test/Test'

import { JOURNEY_TYPES, STEPS_NAMES } from '.'

export const CART_ABANDONMENT_STEPS = {
    journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
    steps: [
        {
            stepName: STEPS_NAMES.SETUP,
            component: Setup,
        },
        {
            stepName: STEPS_NAMES.TEST,
            component: Test,
        },
        {
            stepName: STEPS_NAMES.ACTIVATE,
            component: Activation,
        },
    ],
}

export const BROWSE_ABANDONMENT_STEPS = {
    journeyType: JOURNEY_TYPES.BROWSE_ABANDONMENT,
    steps: [
        {
            stepName: STEPS_NAMES.SETUP,
            component: Setup,
        },
        {
            stepName: STEPS_NAMES.TEST,
            component: Test,
        },
        {
            stepName: STEPS_NAMES.ACTIVATE,
            component: Activation,
        },
    ],
}

// TODO: merge BROWSE_ABANDONMENT_STEPS and CART_ABANDONMENT_STEPS based on FF
export const AI_JOURNEY_ONBOARDING_STEPS = [CART_ABANDONMENT_STEPS]
