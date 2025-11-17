import type { Option } from 'pages/common/forms/SelectField/types'

import { TRIGGERS_CONFIG } from '../constants/triggers'
import type { CampaignTriggerType } from '../types/enums/CampaignTriggerType.enum'

export const convertTriggerOperatorsToSelectOptions = (
    triggerType: CampaignTriggerType,
    multipleInputs?: boolean,
): Option[] => {
    return Object.entries(TRIGGERS_CONFIG[triggerType].operators).map(
        ([operatorName, operatorConfig]) => {
            return {
                value: operatorName,
                label: `${operatorConfig.label} ${
                    multipleInputs ? 'one of' : ''
                }`,
            }
        },
    )
}
