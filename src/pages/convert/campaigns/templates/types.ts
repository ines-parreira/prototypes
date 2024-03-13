export type CampaignConfiguration = {
    name: string
    template_id: string
}

export enum CampaignTemplateLabelType {
    IncreaseConversions = 'Increase Conversions',
    PreventCartAbandonment = 'Prevent Cart Abandonment',
    IncreaseAOV = 'Increase Average Order Value',
}

export type CampaignTemplate = {
    slug: string
    name: string
    preview: string
    label: CampaignTemplateLabelType
    getConfiguration: (
        storeIntegrationId: number,
        chatIntegrationId: number
    ) => CampaignConfiguration
}
