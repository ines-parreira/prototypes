import { createContext } from 'react'

import type {
    DeleteTriggerFn,
    UpdateTriggerFn,
    ValidateStateUpdateFn,
} from '../../types/AdvancedTriggerBaseProps'
import type { CampaignTriggerMap } from '../../types/CampaignTriggerMap'

type ContextModel = {
    triggers: CampaignTriggerMap
    areTriggersValid: boolean
    onUpdateTrigger: UpdateTriggerFn
    onDeleteTrigger: DeleteTriggerFn
    onTriggerValidationUpdate: ValidateStateUpdateFn
}

const TriggersContext = createContext<ContextModel>({
    triggers: {},
    areTriggersValid: false,
    onUpdateTrigger: () => null,
    onDeleteTrigger: () => null,
    onTriggerValidationUpdate: () => null,
})

export default TriggersContext
