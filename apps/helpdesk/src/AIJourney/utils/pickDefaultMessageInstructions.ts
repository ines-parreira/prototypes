import { JourneyTypeEnum } from '@gorgias/convert-client'

import type { JOURNEY_TYPES } from 'AIJourney/constants'
import { JOURNEY_TYPE_MAP_FROM_URL } from 'AIJourney/constants'
import { getTemplateForJourneyType } from 'AIJourney/data/FlowTemplatesData'

type PickDefaultMessageInstructionsArgs = {
    journeyMessageInstructions: string | null | undefined
    isStructuredEditorEnabled: boolean
    initialMessageInstructionsFromState: string | undefined
    journeyType: JOURNEY_TYPES | undefined
}

export const pickDefaultMessageInstructions = ({
    journeyMessageInstructions,
    isStructuredEditorEnabled,
    initialMessageInstructionsFromState,
    journeyType,
}: PickDefaultMessageInstructionsArgs): string => {
    if (journeyMessageInstructions) {
        return journeyMessageInstructions
    }
    if (initialMessageInstructionsFromState) {
        return initialMessageInstructionsFromState
    }
    if (!isStructuredEditorEnabled) return ''
    if (!journeyType) return ''
    const journeyTypeEnum = JOURNEY_TYPE_MAP_FROM_URL[journeyType]
    if (!journeyTypeEnum || journeyTypeEnum === JourneyTypeEnum.Campaign) {
        return ''
    }
    return getTemplateForJourneyType(journeyTypeEnum)?.content ?? ''
}
