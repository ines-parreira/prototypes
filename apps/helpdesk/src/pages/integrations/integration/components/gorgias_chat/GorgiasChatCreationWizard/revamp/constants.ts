import { GorgiasChatCreationWizardSteps } from 'models/integration/types/gorgiasChat'

export const STEP_LABELS: Record<GorgiasChatCreationWizardSteps, string> = {
    [GorgiasChatCreationWizardSteps.Basics]: 'Set up the basics',
    [GorgiasChatCreationWizardSteps.Branding]: 'Brand',
    [GorgiasChatCreationWizardSteps.Automate]: 'Enable order management',
    [GorgiasChatCreationWizardSteps.Installation]: 'Install and launch',
}

export const STEP_DESCRIPTIONS: Partial<
    Record<GorgiasChatCreationWizardSteps, string>
> = {
    [GorgiasChatCreationWizardSteps.Branding]:
        "Give the chat widget your brand's look and feel",
}
