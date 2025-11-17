import type { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'

export interface PostOnboardingStepMetadata {
    stepName: StepName
    stepTitle: string
    stepDescription: string
    stepImage?: string
}

export type ChatWarningDecision =
    | { visible: false }
    | {
          visible: true
          label: 'Configure a chat' | 'Connect a chat' | 'Install a chat'
          to: string
      }
