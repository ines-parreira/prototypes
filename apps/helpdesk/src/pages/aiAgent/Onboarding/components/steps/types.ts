import type { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'

export type StepProps = {
    totalSteps: number
    currentStep: number
    goToStep: (step: WizardStepEnum) => void
    isStoreSelected?: boolean
}

export enum KnowledgeSourceType {
    DOMAIN = 'domain',
    SHOPIFY = 'shopify',
    HELP_CENTER = 'help_center',
    OTHER = 'other',
}

export enum KnowledgeStatus {
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
}
