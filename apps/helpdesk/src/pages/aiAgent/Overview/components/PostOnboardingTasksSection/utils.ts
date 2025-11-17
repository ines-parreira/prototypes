import { isAxiosError } from 'axios'
import _get from 'lodash/get'

import {
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import type { InstallationStatusInjectedChatItem } from 'pages/aiAgent/components/ChatIntegrationListSelection/ChatIntegrationListSelection'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'
import { assetsUrl } from 'utils'

import type { ChatWarningDecision, PostOnboardingStepMetadata } from './types'

export const MAX_VISIBLE_GUIDANCES_TRAIN_SECTION = 5

export const POST_ONBOARDING_STEPS_METADATA: Record<
    string,
    PostOnboardingStepMetadata
> = {
    TRAIN: {
        stepName: StepName.TRAIN,
        stepTitle: 'Train AI Agent',
        stepDescription:
            'Guidance are custom instructions that you write for your AI Agent. Create Guidance to train your AI Agent on how to respond to and resolve common customer scenarios. We recommend creating at least 5 pieces of Guidance to set your AI Agent up for success. Learn <a href="https://link.gorgias.com/rb3" target="_blank" rel="noopener noreferrer">best practices</a> for writing Guidance.',
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

export const decideChatWarning = (
    chatChannels: Array<InstallationStatusInjectedChatItem> | undefined,
    monitoredIdsInput: string[] | undefined,
    routes: { deployChat: string },
): ChatWarningDecision => {
    const chats = chatChannels ?? []
    const monitoredIds = new Set(monitoredIdsInput ?? [])

    if (chats.length === 0) {
        return {
            visible: true,
            label: 'Configure a chat',
            to: '/app/settings/channels/gorgias_chat/new/create-wizard',
        }
    }

    if (monitoredIds.size === 0) {
        return { visible: true, label: 'Connect a chat', to: routes.deployChat }
    }

    const selected = chats.filter((c) =>
        monitoredIds.has(c.value.id.toString()),
    )
    if (selected.length < monitoredIds.size) {
        return { visible: true, label: 'Connect a chat', to: routes.deployChat }
    }

    const uninstalled = selected.find((c) => c.value.isUninstalled)
    if (uninstalled) {
        return {
            visible: true,
            label: 'Install a chat',
            to: `/app/settings/channels/gorgias_chat/${uninstalled.value.id}/installation`,
        }
    }

    return { visible: false }
}

export const handleAiAgentConfigurationError = (
    error: unknown,
    dispatch: StoreDispatch,
): void => {
    if (isAxiosError(error) && _get(error, 'response.status') === 409) {
        void dispatch(
            notify({
                message:
                    'Email address or chat channel already used by AI Agent on a different store.',
                status: NotificationStatus.Error,
            }),
        )
    } else {
        void dispatch(
            notify({
                message: 'Failed to save AI Agent configuration',
                status: NotificationStatus.Error,
            }),
        )
    }
}
