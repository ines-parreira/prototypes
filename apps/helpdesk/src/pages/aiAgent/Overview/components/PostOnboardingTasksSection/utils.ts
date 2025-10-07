import {
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { assetsUrl } from 'utils'

import { PostOnboardingStepMetadata } from './types'

export const POST_ONBOARDING_STEPS_METADATA: Record<
    string,
    PostOnboardingStepMetadata
> = {
    TRAIN: {
        stepName: StepName.TRAIN,
        stepTitle: 'Train AI Agent',
        stepDescription:
            'Guidance are custom instructions that you write for AI Agent. Create Guidance to train AI Agent how to respond to and resolve common customer scenarios. We recommend creating at least 5 guidances to set your AI Agent up for success. Learn best practices for writing Guidance.',
        stepImage: assetsUrl('/img/ai-agent/post_onboarding_task_guidance.png'),
    },
    TEST: {
        stepName: StepName.TEST,
        stepTitle: 'Test AI Agent',
        stepDescription:
            'See how AI Agent performs before you go live. Ask it questions your customers might ask to see how it responds. To make changes, click on the source AI Agent used to make edits, then re-test.',
        stepImage: assetsUrl('/img/ai-agent/post_onboarding_task_test.png'),
    },
    DEPLOY: {
        stepName: StepName.DEPLOY,
        stepTitle: 'Deploy AI Agent',
        stepDescription:
            'Start automating conversations on email or chat to save time and provide faster, more personalized responses to your customers.',
    },
}

export const DEFAULT_STEP_CONFIGURATION = {
    stepStartedDatetime: null,
    stepCompletedDatetime: null,
    stepDismissedDatetime: null,
}

export const DEFAULT_POST_ONBOARDING_STEPS = {
    status: PostStoreInstallationStepStatus.NOT_STARTED,
    type: PostStoreInstallationStepType.POST_ONBOARDING,
    stepsConfiguration: [
        {
            ...DEFAULT_STEP_CONFIGURATION,
            stepName: StepName.TRAIN,
        },
        {
            ...DEFAULT_STEP_CONFIGURATION,
            stepName: StepName.TEST,
        },
        {
            ...DEFAULT_STEP_CONFIGURATION,
            stepName: StepName.DEPLOY,
        },
    ],
    notificationsConfiguration: {
        guidanceInactivityAcknowledgedAt: null,
        deployInactivityAcknowledgedAt: null,
    },
    completedDatetime: null,
}

const TAB_TO_STEP_NAME_MAP: Record<string, StepName> = {
    train: StepName.TRAIN,
    test: StepName.TEST,
    deploy: StepName.DEPLOY,
}

export const mapTabToStepName = (tab: string | null): StepName | null => {
    if (!tab) return null
    return TAB_TO_STEP_NAME_MAP[tab] ?? null
}
