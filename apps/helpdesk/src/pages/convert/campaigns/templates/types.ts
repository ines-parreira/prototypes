import type { Map } from 'immutable'

import type { CampaignCreatePayload } from 'pages/convert/campaigns/types/Campaign'
import type { WizardConfiguration } from 'pages/convert/campaigns/types/CampaignFormConfiguration'

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
    preview: string
    estimation?: { [key: string]: string }
    description?: string
    label?: CampaignTemplateLabelType
    onboarding: boolean
    getWizardConfiguration?: () => WizardConfiguration
    getConfiguration: (
        storeIntegration: Map<string, any>,
        chatIntegration: Map<string, any>,
    ) => Promise<CampaignConfiguration>
    postSave?: (
        storeIntegration: Map<string, any>,
        chatIntegration: Map<string, any>,
    ) => Promise<boolean>
}
