import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import { assetsUrl } from 'utils'

export type NudgeMetadata = {
    stepName: StepName
    title: string
    description: string
    image: string
    primaryActionLabel: string
    primaryActionPath: (shopType: string, shopName: string) => string
    secondaryActionLabel: string
}

export const POST_ONBOARDING_NUDGES_METADATA: Record<string, NudgeMetadata> = {
    TRAIN: {
        stepName: StepName.TRAIN,
        title: 'Your AI Agent is getting smarter',
        description:
            'Each piece of knowledge you add trains AI Agent to become more capable and respond to customers with accurate, on-brand answers. Pick up where you left off.',
        image: assetsUrl('/img/ai-agent/ai-agent-nudge-knowledge.png'),
        primaryActionLabel: 'Keep adding knowledge',
        primaryActionPath: (shopType, shopName) =>
            `/app/ai-agent/${shopType}/${shopName}/overview`,
        secondaryActionLabel: 'Maybe later',
    },
    DEPLOY: {
        stepName: StepName.DEPLOY,
        title: "You're almost there!",
        description:
            "You've created guidance and tested AI Agent. The final step is to deploy AI Agent across your channels so it can start helping customers find answers.",
        image: assetsUrl('/img/ai-agent/ai-agent-nudge-deployment.gif'),
        primaryActionLabel: 'Deploy AI Agent',
        primaryActionPath: (shopType, shopName) =>
            `/app/ai-agent/${shopType}/${shopName}/overview`,
        secondaryActionLabel: 'Maybe later',
    },
}
