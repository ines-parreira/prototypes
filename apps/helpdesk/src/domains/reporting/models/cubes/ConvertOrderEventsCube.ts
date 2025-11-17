import type { Cube } from 'domains/reporting/models/types'
import type {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
} from 'domains/reporting/pages/convert/clients/constants'

export type ConvertOrderEventsCube = Cube<
    CampaignOrderEventsMeasure,
    CampaignOrderEventsDimension,
    never,
    never
>
