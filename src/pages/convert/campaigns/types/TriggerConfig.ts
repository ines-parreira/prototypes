import { CampaignTriggerOperator } from '../types/enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from '../types/enums/CampaignTriggerType.enum'

export type TriggerConfigOperators = {
    [key in CampaignTriggerOperator]?: {
        label: string
    }
}

export type TriggerConfigValue = {
    label: string
    group: string
    defaults: {
        value: any
        operator: CampaignTriggerOperator
    }
    requirements: {
        hidden?: boolean
        revenue?: boolean
        shopify?: boolean
        headless?: boolean
    }
    operators: TriggerConfigOperators
}

export type TriggerConfig = {
    [key in CampaignTriggerType]: TriggerConfigValue
}
