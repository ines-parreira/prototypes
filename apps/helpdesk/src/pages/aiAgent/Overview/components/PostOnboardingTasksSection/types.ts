import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'

export interface PostOnboardingStepMetadata {
    stepName: StepName
    stepTitle: string
    stepDescription: string
    stepImage?: string
}
