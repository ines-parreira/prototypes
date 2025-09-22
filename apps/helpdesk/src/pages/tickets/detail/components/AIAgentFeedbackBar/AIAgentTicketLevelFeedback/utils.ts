import { AiAgentBadInteractionReason } from '../types'

export const badInteractionOptions: Record<
    AiAgentBadInteractionReason,
    string
> = {
    [AiAgentBadInteractionReason.WRONG_KNOWLEDGE]: 'Wrong knowledge used',
    [AiAgentBadInteractionReason.IGNORED_KNOWLEDGE]:
        "Didn't follow knowledge content",
    [AiAgentBadInteractionReason.MISSING_KNOWLEDGE]: 'Missing knowledge',
    [AiAgentBadInteractionReason.ACTION_NOT_PERFORMED]: 'Action not performed',
    [AiAgentBadInteractionReason.ACTION_INCORRECTLY_PERFORMED]:
        'Action incorrectly performed',
    [AiAgentBadInteractionReason.TONE_OF_VOICE_NOT_ALIGNED]:
        'Tone of voice not aligned',
    [AiAgentBadInteractionReason.OVERPROMISE]: 'Overpromise',
    [AiAgentBadInteractionReason.REPETITIVE_MESSAGES]: 'Repetitive messages',
    [AiAgentBadInteractionReason.SHOULD_NOT_HAND_OVER]: 'Should not hand over',
    [AiAgentBadInteractionReason.SHOULD_HAND_OVER_SOONER]:
        'Should hand over sooner',
    [AiAgentBadInteractionReason.REPLIED_TO_HANDOVER_TOPIC]:
        'Replied to handover topic',
    [AiAgentBadInteractionReason.SHOULD_NOT_HAVE_CLOSED_TICKET]:
        'Should not have closed ticket',
    [AiAgentBadInteractionReason.INCORRECT_STOCK_OR_INVENTORY_INFO]:
        'Incorrect stock or inventory info',
    [AiAgentBadInteractionReason.COULDNT_FIND_ORDER_BY_EMAIL]:
        "Couldn't find order by email",
    [AiAgentBadInteractionReason.DISCOUNT_ISSUE]: 'Discount issue',
    [AiAgentBadInteractionReason.IRRELEVANT_PRODUCT_RECCOMENDATION]:
        'Irrelevant product recommendation',
    [AiAgentBadInteractionReason.SOMEWHAT_RELEVANT_PRODUCT_RECOMMENDATION]:
        'Somewhat relevant recommendation',
    [AiAgentBadInteractionReason.NO_PRODUCT_RECOMMENDATION]:
        'No product recommendation',
    [AiAgentBadInteractionReason.SHOULD_NOT_TRY_TO_SELL]:
        'Should not try to sell',
    [AiAgentBadInteractionReason.OTHER]:
        'Other (explain in additional feedback)',
}
export const badInteractionReverseOptions: Record<
    string,
    AiAgentBadInteractionReason
> = Object.entries(badInteractionOptions).reduce(
    (acc, [key, value]) => {
        acc[value] = key as AiAgentBadInteractionReason
        return acc
    },
    {} as Record<string, AiAgentBadInteractionReason>,
)

export const badInteractionReasonsChoices = Object.values(badInteractionOptions)

// Sort values by the order they appear in badInteractionOptions
export const sortValuesByBadInteractionOrder = (values: string[]): string[] => {
    const orderedValues = Object.values(badInteractionOptions)
    return values.sort((a, b) => {
        const indexA = orderedValues.indexOf(a)
        const indexB = orderedValues.indexOf(b)
        return indexA - indexB
    })
}
