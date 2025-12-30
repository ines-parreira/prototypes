import { GorgiasChatCreationWizardSteps } from 'models/integration/types/gorgiasChat'

export const STEP_LABELS: Record<GorgiasChatCreationWizardSteps, string> = {
    [GorgiasChatCreationWizardSteps.Basics]: 'Set up the basics',
    [GorgiasChatCreationWizardSteps.Branding]: 'Brand',
    [GorgiasChatCreationWizardSteps.Automate]: 'AI Agent',
    [GorgiasChatCreationWizardSteps.Installation]: 'Install and launch',
}

export const STEP_DESCRIPTIONS: Partial<
    Record<GorgiasChatCreationWizardSteps, string>
> = {
    [GorgiasChatCreationWizardSteps.Branding]:
        "Give the chat widget your brand's look and feel",
    [GorgiasChatCreationWizardSteps.Automate]:
        'Quickly activate AI Agent features to start instantly answering common questions',
    [GorgiasChatCreationWizardSteps.Installation]:
        'Install the chat widget on your website and make it available for customers',
}
