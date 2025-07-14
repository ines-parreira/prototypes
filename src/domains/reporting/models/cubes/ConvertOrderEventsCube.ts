import { Cube } from 'domains/reporting/models/types'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
} from 'domains/reporting/pages/convert/clients/constants'

export type ConvertOrderEventsCube = Cube<
    CampaignOrderEventsMeasure,
    CampaignOrderEventsDimension,
    never,
    never
>
