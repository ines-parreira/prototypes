import type { TableMeta } from '@gorgias/axiom'
import { JourneyApiDTO } from '@gorgias/convert-client'

export interface CampaignsTableMeta extends TableMeta<JourneyApiDTO> {
    onRemoveClick: (id: string) => void
    onSendClick: (id: string) => void
}
