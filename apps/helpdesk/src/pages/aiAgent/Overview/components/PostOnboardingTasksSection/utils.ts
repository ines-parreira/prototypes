import { assetsUrl } from 'utils'

import { PostOnboardingTask } from './types'

export const POST_ONBOARDING_TASKS: Record<string, PostOnboardingTask> = {
    TRAIN: {
        stepName: 'TRAIN',
        stepTitle: 'Train AI Agent',
        stepDescription:
            'Guidance are custom instructions that you write for AI Agent. Create Guidance to train AI Agent how to respond to and resolve common customer scenarios. We recommend creating at least 5 guidances to set your AI Agent up for success. Learn best practices for writing Guidance.',
        stepImage: assetsUrl('/img/ai-agent/post_onboarding_task_guidance.png'),
    },
    TEST: {
        stepName: 'TEST',
        stepTitle: 'Test AI Agent',
        stepDescription:
            'See how AI Agent performs before you go live. Ask it questions your customers might ask to see how it responds. To make changes, click on the source AI Agent used to make edits, then re-test.',
        stepImage: assetsUrl('/img/ai-agent/post_onboarding_task_test.png'),
    },
    DEPLOY: {
        stepName: 'DEPLOY',
        stepTitle: 'Deploy AI Agent',
        stepDescription:
            'Start automating conversations on email or chat to save time and provide faster, more personalized responses to your customers.',
    },
}
