import { Cube } from 'models/reporting/types'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
} from 'pages/stats/convert/clients/constants'

export type ConvertOrderEventsCube = Cube<
    CampaignOrderEventsMeasure,
    CampaignOrderEventsDimension,
    never,
    never
>
