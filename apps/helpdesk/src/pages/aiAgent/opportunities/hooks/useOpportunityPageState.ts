import { useMemo } from 'react'

import { useGetPostStoreInstallationStepsPure } from 'models/aiAgentPostStoreInstallationSteps/queries'
import { PostStoreInstallationStepType } from 'models/aiAgentPostStoreInstallationSteps/types'
import type { LocaleCode } from 'models/helpCenter/types'
import { useOpportunitiesCount } from 'pages/aiAgent/hooks/useOpportunitiesCount'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'

export enum State {
    LOADING = 'LOADING',
    HAS_OPPORTUNITIES = 'HAS_OPPORTUNITIES',
    ENABLED_NO_OPPORTUNITIES = 'ENABLED_NO_OPPORTUNITIES',
    DISABLED_NEEDS_ENABLE = 'DISABLED_NEEDS_ENABLE',
    DISABLED_NEEDS_SETUP = 'DISABLED_NEEDS_SETUP',
}

export interface OpportunityPageCta {
    label: string
    href?: string
}

export interface OpportunityPageState {
    state: State
    isLoading: boolean
    title: string
    description: string
    media: string | null
    primaryCta: OpportunityPageCta | null
    showEmptyState: boolean
}

export interface UseOpportunityPageStateParams {
    helpCenterId: number
    locale: LocaleCode
    shopName: string
    accountId: number
    shopType: string
}

const getStateConfig = (
    shopType: string,
    shopName: string,
): Record<State, OpportunityPageState> => ({
    [State.LOADING]: {
        state: State.LOADING,
        title: '',
        description: '',
        media: null,
        primaryCta: null,
        showEmptyState: false,
        isLoading: true,
    },
    [State.HAS_OPPORTUNITIES]: {
        state: State.HAS_OPPORTUNITIES,
        title: 'Opportunities',
        description: '',
        media: null,
        primaryCta: null,
        showEmptyState: false,
        isLoading: false,
    },
    [State.ENABLED_NO_OPPORTUNITIES]: {
        state: State.ENABLED_NO_OPPORTUNITIES,
        title: 'AI Agent is learning from your conversations',
        description:
            "As AI Agent handles more conversations, we'll surface opportunities to improve its accuracy and coverage. Check back soon!",
        media: '/assets/images/ai-agent/opportunities/learning.svg',
        primaryCta: null,
        showEmptyState: true,
        isLoading: false,
    },
    [State.DISABLED_NEEDS_ENABLE]: {
        state: State.DISABLED_NEEDS_ENABLE,
        title: 'Let AI Agent show you what to improve',
        description:
            'AI Agent automatically finds opportunities to improve its responses based on customer conversations. AI Agent needs to be enabled to start learning from conversations.',
        media: '/assets/images/ai-agent/opportunities/needs-enable.svg',
        primaryCta: {
            label: 'Enable AI Agent',
            href: `/app/ai-agent/${shopType}/${shopName}/deploy/email`,
        },
        showEmptyState: true,
        isLoading: false,
    },
    [State.DISABLED_NEEDS_SETUP]: {
        state: State.DISABLED_NEEDS_SETUP,
        title: 'Let AI Agent show you what to improve',
        description:
            'AI Agent automatically finds opportunities to improve its responses based on customer conversations. AI Agent needs to be enabled to start learning from conversations.',
        media: '/assets/images/ai-agent/opportunities/needs-setup.svg',
        primaryCta: {
            label: 'Complete setup',
            href: `/app/ai-agent/${shopType}/${shopName}/overview`,
        },
        showEmptyState: true,
        isLoading: false,
    },
})

export function useOpportunityPageState({
    helpCenterId,
    locale,
    shopName,
    accountId,
    shopType,
}: UseOpportunityPageStateParams): OpportunityPageState {
    const { storeConfiguration, isLoading: isLoadingStoreConfig } =
        useAiAgentStoreConfigurationContext()
    const { count: opportunitiesCount, isLoading: isLoadingOpportunities } =
        useOpportunitiesCount(helpCenterId, locale, shopName)

    const {
        data: postStoreInstallationStepsData,
        isLoading: isLoadingPostStoreSteps,
    } = useGetPostStoreInstallationStepsPure(
        {
            accountId,
            shopName,
            shopType,
        },
        { retry: 1, refetchOnWindowFocus: false },
    )

    const state = useMemo((): State => {
        const isLoadingAnyData =
            isLoadingStoreConfig ||
            isLoadingOpportunities ||
            isLoadingPostStoreSteps

        if (isLoadingAnyData) {
            return State.LOADING
        }

        const hasOpportunities = (opportunitiesCount ?? 0) > 0

        if (hasOpportunities) {
            return State.HAS_OPPORTUNITIES
        }

        const isAiAgentEnabled = storeConfiguration
            ? isAiAgentEnabledForStore(storeConfiguration)
            : false

        if (isAiAgentEnabled) {
            return State.ENABLED_NO_OPPORTUNITIES
        }

        const postOnboardingStep =
            postStoreInstallationStepsData?.postStoreInstallationSteps?.find(
                (step) =>
                    step.type === PostStoreInstallationStepType.POST_ONBOARDING,
            )
        const isPostOnboardingComplete = Boolean(
            postOnboardingStep?.completedDatetime,
        )

        if (isPostOnboardingComplete) {
            return State.DISABLED_NEEDS_ENABLE
        }

        return State.DISABLED_NEEDS_SETUP
    }, [
        isLoadingStoreConfig,
        isLoadingOpportunities,
        isLoadingPostStoreSteps,
        opportunitiesCount,
        storeConfiguration,
        postStoreInstallationStepsData,
    ])

    const stateConfig = getStateConfig(shopType, shopName)

    return stateConfig[state]
}
