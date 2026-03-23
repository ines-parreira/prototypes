import { GorgiasChatCreationWizardSteps } from 'models/integration/types/gorgiasChat'

export const STEP_LABELS: Record<GorgiasChatCreationWizardSteps, string> = {
    [GorgiasChatCreationWizardSteps.Basics]: 'Set up the basics',
    [GorgiasChatCreationWizardSteps.Branding]: 'Brand',
    [GorgiasChatCreationWizardSteps.Automate]: 'Enable order management',
    [GorgiasChatCreationWizardSteps.Installation]: 'Install and launch',
}
