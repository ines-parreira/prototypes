import type { TableMeta } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import type { UpdatableJourneyCampaignState } from 'AIJourney/constants'

export interface CampaignsTableMeta extends TableMeta<JourneyApiDTO> {
    onRemoveClick: (id: string) => void
    onSendClick: (id: string, hasIncludedAudiences: boolean) => void
    onCancelClick: (id: string) => void
    onDuplicateClick: (journey: JourneyApiDTO) => void
    onChangeStatus: (id: string, status: UpdatableJourneyCampaignState) => void
    currency: string
}
