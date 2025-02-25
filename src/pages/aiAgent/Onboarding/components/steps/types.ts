import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'

export type StepProps = {
    totalSteps: number
    currentStep: number
    goToStep: (step: WizardStepEnum) => void
}

export enum KnowledgeSourceType {
    SHOPIFY = 'shopify',
    HELP_CENTER = 'help_center',
    OTHER = 'other',
}

export enum KnowledgeStatus {
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
}

// TODO: remove this once the real API and types exist
export type TemporaryKnowledgeData = {
    url: string
    domain: string
    status: KnowledgeStatus
}
