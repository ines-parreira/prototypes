import {Value} from 'pages/common/forms/SelectField/types'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {UpdateTriggerFn} from '../types/AdvancedTriggerBaseProps'
import {CampaignTrigger} from '../types/CampaignTrigger'
import {isTriggerOperatorAllowed} from './isTriggerOperatorAllowed'

export const handleTriggerOperatorChange = (
    operator: Value,
    id: string,
    trigger: CampaignTrigger,
    setOperator: React.Dispatch<CampaignTriggerOperator>,
    onUpdateTrigger: UpdateTriggerFn
) => {
    const operatorValue = operator as CampaignTriggerOperator
    if (isTriggerOperatorAllowed(operatorValue, trigger.type)) {
        setOperator(operatorValue)
        onUpdateTrigger(id, {...trigger, operator: operatorValue})
    }
}
