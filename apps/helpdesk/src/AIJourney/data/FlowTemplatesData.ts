import { JourneyTypeEnum } from '@gorgias/convert-client'

export type FlowTemplate = {
    name: string
    content: string | null
}

// Flow templates content is not yet available — to be added once Zhi delivers
// the canonical copy for each flow type.
export const FlowTemplatesData: Partial<Record<JourneyTypeEnum, FlowTemplate>> =
    {
        [JourneyTypeEnum.Welcome]: {
            name: 'Welcome flow',
            content: null,
        },
        [JourneyTypeEnum.CartAbandoned]: {
            name: 'Cart abandoned flow',
            content: null,
        },
        [JourneyTypeEnum.SessionAbandoned]: {
            name: 'Session abandoned flow',
            content: null,
        },
        [JourneyTypeEnum.PostPurchase]: {
            name: 'Post-purchase flow',
            content: null,
        },
        [JourneyTypeEnum.WinBack]: {
            name: 'Win-back flow',
            content: null,
        },
    }

export const getTemplateForJourneyType = (
    journeyType: JourneyTypeEnum | undefined,
): FlowTemplate | undefined => {
    if (!journeyType) return undefined
    return FlowTemplatesData[journeyType]
}
