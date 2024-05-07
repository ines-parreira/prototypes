import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'

export type ValidatorType = (
    value: string,
    operator: CampaignTriggerOperator
) => boolean | void
