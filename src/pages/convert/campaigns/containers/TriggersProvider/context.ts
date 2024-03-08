import {createContext} from 'react'
import {
    DeleteTriggerFn,
    UpdateTriggerFn,
} from '../../types/AdvancedTriggerBaseProps'

import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'

type ContextModel = {
    triggers: CampaignTriggerMap
    onUpdateTrigger: UpdateTriggerFn
    onDeleteTrigger: DeleteTriggerFn
}

const TriggersContext = createContext<ContextModel>({
    triggers: {},
    onUpdateTrigger: () => null,
    onDeleteTrigger: () => null,
})

export default TriggersContext
