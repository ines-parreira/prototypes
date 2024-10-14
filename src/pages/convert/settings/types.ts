export type DisclaimerSettings = {
    disclaimerEnabled: boolean
    disclaimerMap: Record<string, string>
    selectedLanguage: string
    preSelectDisclaimer: boolean
}

export type CaptureFormDisclaimerSettings = {
    enabled: boolean
    disclaimer: Record<string, string>
    disclaimer_default_accepted: boolean
}

export type MaxCampaignDisplaysInSession = {
    value: number
}

export type MinimumTimeBetweenCampaigns = {
    value: number
    unit: 'seconds' | 'minutes' | 'hours'
}

export type CampaignFrequencySettings = {
    max_campaign_in_session?: MaxCampaignDisplaysInSession | null
    min_time_between_campaigns?: MinimumTimeBetweenCampaigns | null
}
