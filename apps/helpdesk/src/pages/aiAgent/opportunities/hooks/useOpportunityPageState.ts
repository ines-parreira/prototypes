import { useMemo } from 'react'

import { THEME_NAME } from '@gorgias/design-tokens'

import aiAgentButtonEnableGif from 'assets/img/ai-agent/ai-agent-button-enable.gif'
import aiAgentScanGif from 'assets/img/ai-agent/ai-agent-scan.gif'
import aiAgentUpgradeOpportunitiesDark from 'assets/img/ai-agent/ai-agent-upgrade-opportunities-dark.svg'
import aiAgentUpgradeOpportunitiesLight from 'assets/img/ai-agent/ai-agent-upgrade-opportunities-light.svg'
import { useTheme } from 'core/theme'
import { useGetPostStoreInstallationStepsPure } from 'models/aiAgentPostStoreInstallationSteps/queries'
import { PostStoreInstallationStepType } from 'models/aiAgentPostStoreInstallationSteps/types'
import type { LocaleCode } from 'models/helpCenter/types'
import { useOpportunitiesCount } from 'pages/aiAgent/hooks/useOpportunitiesCount'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'

import { MIN_TOTAL_OPPORTUNITIES_THRESHOLD } from '../constants'

export enum State {
    LOADING = 'LOADING',
    HAS_OPPORTUNITIES = 'HAS_OPPORTUNITIES',
    ENABLED_NO_OPPORTUNITIES = 'ENABLED_NO_OPPORTUNITIES',
    DISABLED_NEEDS_ENABLE = 'DISABLED_NEEDS_ENABLE',
    DISABLED_NEEDS_SETUP = 'DISABLED_NEEDS_SETUP',
    RESTRICTED_NO_OPPORTUNITIES = 'RESTRICTED_NO_OPPORTUNITIES',
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
    allowedOpportunityIds?: number[]
    totalAllowedCount?: number
}

const getStateConfig = (
    shopType: string,
    shopName: string,
    isDarkTheme: boolean,
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
        title: '',
        description: '',
        media: null,
        primaryCta: null,
        showEmptyState: false,
        isLoading: false,
    },
    [State.ENABLED_NO_OPPORTUNITIES]: {
        state: State.ENABLED_NO_OPPORTUNITIES,
        title: 'No opportunities to review right now',
        description:
            'AI Agent reviews real customer conversations to identify patterns and improvement opportunities. Once there’s enough data, we’ll surface actionable insights here.',
        media: aiAgentScanGif,
        primaryCta: null,
        showEmptyState: true,
        isLoading: false,
    },
    [State.DISABLED_NEEDS_ENABLE]: {
        state: State.DISABLED_NEEDS_ENABLE,
        title: 'Let AI Agent show you what to improve',
        description:
            'AI Agent finds opportunities to improve its responses based on your customer conversations. AI Agent needs to be enabled to start learning.',
        media: aiAgentButtonEnableGif,
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
        media: aiAgentButtonEnableGif,
        primaryCta: {
            label: 'Complete AI Agent setup',
            href: `/app/ai-agent/${shopType}/${shopName}/overview`,
        },
        showEmptyState: true,
        isLoading: false,
    },
    [State.RESTRICTED_NO_OPPORTUNITIES]: {
        state: State.RESTRICTED_NO_OPPORTUNITIES,
        title: 'Upgrade to unlock more AI Agent opportunities',
        // TODO: expose the hardcoded 3 as metadata from the backend
        description: `You've reviewed 3 opportunities for AI Agent. To continue discovering and acting on new opportunities based on real customer conversations, upgrade your plan.`,
        media: isDarkTheme
            ? aiAgentUpgradeOpportunitiesDark
            : aiAgentUpgradeOpportunitiesLight,
        primaryCta: {
            label: 'Try for 14 days',
        },
        showEmptyState: false,
        isLoading: false,
    },
})

export function useOpportunityPageState({
    helpCenterId,
    locale,
    shopName,
    accountId,
    shopType,
    allowedOpportunityIds,
}: UseOpportunityPageStateParams): OpportunityPageState {
    const theme = useTheme()
    const { storeConfiguration, isLoading: isLoadingStoreConfig } =
        useAiAgentStoreConfigurationContext()
    const {
        count: opportunitiesCount,
        isLoading: isLoadingOpportunities,
        totalCount,
    } = useOpportunitiesCount(helpCenterId, locale, shopName)

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

        const shouldWaitForMoreOpportunities =
            allowedOpportunityIds !== undefined &&
            totalCount < MIN_TOTAL_OPPORTUNITIES_THRESHOLD
        if (shouldWaitForMoreOpportunities) {
            return State.ENABLED_NO_OPPORTUNITIES
        }

        const shouldShowPaywall =
            allowedOpportunityIds !== undefined &&
            allowedOpportunityIds.length === 0
        if (shouldShowPaywall) {
            return State.RESTRICTED_NO_OPPORTUNITIES
        }

        // If restricted user has no more opportunities, show upgrade message
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
        allowedOpportunityIds,
        totalCount,
    ])

    const isDarkTheme = theme.resolvedName === THEME_NAME.Dark
    const stateConfig = getStateConfig(shopType, shopName, isDarkTheme)

    return stateConfig[state]
}
