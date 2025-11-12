import type { TableMeta } from '@gorgias/axiom'
import { JourneyApiDTO } from '@gorgias/convert-client'

import { UpdatableJourneyCampaignState } from 'AIJourney/constants'

export interface CampaignsTableMeta extends TableMeta<JourneyApiDTO> {
    onRemoveClick: (id: string) => void
    onSendClick: (id: string) => void
    onCancelClick: (id: string) => void
    onDuplicateClick: (journey: JourneyApiDTO) => void
    onChangeStatus: (id: string, status: UpdatableJourneyCampaignState) => void
}
