import {Option} from 'pages/common/forms/SelectField/types'
import {TRIGGERS_CONFIG} from '../constants/triggers'
import {CampaignTriggerType} from '../types/enums/CampaignTriggerType.enum'

export const convertTriggerOperatorsToSelectOptions = (
    triggerType: CampaignTriggerType
): Option[] => {
    return Object.entries(TRIGGERS_CONFIG[triggerType].operators).map(
        ([operatorName, operatorConfig]) => {
            return {
                value: operatorName,
                label: operatorConfig.label,
            }
        }
    )
}
