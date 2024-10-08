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
