import {CampaignCreatePayload} from 'pages/convert/campaigns/types/Campaign'

export type CampaignConfiguration = {
    template_id: string
} & Omit<CampaignCreatePayload, 'channel_connection_id'>

export enum CampaignTemplateLabelType {
    IncreaseConversions = 'Increase Conversions',
    PreventCartAbandonment = 'Prevent Cart Abandonment',
    IncreaseAOV = 'Increase Average Order Value',
}

export type CampaignTemplateSectionType = {
    title: string
    description: string
    templates: CampaignTemplate[]
}

export type CampaignTemplate = {
    slug: string
    name: string
    description?: string
    preview: string
    estimation?: string
    label: CampaignTemplateLabelType
    onboarding: boolean
    getConfiguration: (
        storeIntegrationId: number,
        chatIntegrationId: number
    ) => CampaignConfiguration
}
