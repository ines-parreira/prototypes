/**
 * Visual-only stories for the §5 TrialOptInBanner UI.
 *
 * The real banner reads from `useTrialAccess` + `useShoppingAssistantTrialFlow`
 * + `useTrialModalProps`, which would require seeding most of the trial data
 * graph (billing, trials, store activations) just to render. To avoid that,
 * these stories render the banner shell directly with state-controlled modal
 * mount — visually identical to production, plus the modal stack is wired to
 * the real `TrialActivationModal` so the post-click experience is real.
 */

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { action } from 'storybook/actions'
import { Banner, Button } from '@gorgias/axiom'

import { trialsKeys } from 'models/aiAgent/queries'
import { aiAgentGen6PlanQuery } from 'models/billing/queries'
import { Cadence } from 'models/billing/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialActivationModal } from 'pages/aiAgent/trial/components/TrialActivationModal'
import type { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'

const STORYBOOK_DOMAIN = 'storybook.local'

const STORY_NEW_PLAN = {
    title: 'AI Agent',
    description: 'Updated AI Agent plan',
    price: '$30',
    currency: 'USD',
    billingPeriod: Cadence.Month,
    features: [],
    buttonText: 'Start trial',
} as unknown as PlanDetails

const STORY_UPGRADE_PLAN = {
    amount: 3000,
    currency: 'USD',
    cadence: Cadence.Month,
    num_quota_tickets: 250,
}

const BANNER_DESCRIPTION_BY_TRIAL_TYPE: Record<TrialType, string> = {
    [TrialType.AiAgent]:
        'Start your 2-week trial to let AI Agent respond to your shoppers.',
    [TrialType.ShoppingAssistant]:
        'Start your 2-week trial to let AI Agent respond to your customers.',
}

type BannerStoryProps = {
    trialType: TrialType
    isLoading?: boolean
}

const TrialOptInBannerStory = ({
    trialType,
    isLoading = false,
}: BannerStoryProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Banner
                intent="ai"
                icon="ai-sparkles"
                title="AI Agent is ready"
                description={BANNER_DESCRIPTION_BY_TRIAL_TYPE[trialType]}
                isClosable={false}
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                >
                    Start trial
                </Button>
            </Banner>

            <TrialActivationModal
                isOpen={isModalOpen}
                onClose={() => {
                    action('onClose')()
                    setIsModalOpen(false)
                }}
                onConfirm={(optedInForUpgrade) => {
                    action('onConfirm')(optedInForUpgrade)
                    setIsModalOpen(false)
                }}
                trialType={trialType}
                newPlan={STORY_NEW_PLAN}
                isLoading={isLoading}
            />
        </>
    )
}

const withMockProviders = (Story: () => JSX.Element) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })

    queryClient.setQueryData(aiAgentGen6PlanQuery.queryKey, {
        plan: STORY_UPGRADE_PLAN,
    })
    queryClient.setQueryData(trialsKeys.list(STORYBOOK_DOMAIN), [])

    const store = configureMockStore()({
        currentAccount: fromJS({ domain: STORYBOOK_DOMAIN }),
    })

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <Story />
            </QueryClientProvider>
        </Provider>
    )
}

const meta: Meta<typeof TrialOptInBannerStory> = {
    title: 'AI Agent/Overview/TrialOptInBanner',
    component: TrialOptInBannerStory,
    parameters: { layout: 'fullscreen' },
    decorators: [withMockProviders],
}

export default meta

type Story = StoryObj<typeof TrialOptInBannerStory>

export const AiAgentCohort: Story = {
    name: 'Banner · AI Agent trial (cohorts #10/#11)',
    args: { trialType: TrialType.AiAgent },
}

export const ShoppingAssistantCohort: Story = {
    name: 'Banner · Shopping Assistant trial (cohorts #15/#16)',
    args: { trialType: TrialType.ShoppingAssistant },
}

export const LoadingState: Story = {
    name: 'Banner · loading after confirm',
    args: { trialType: TrialType.AiAgent, isLoading: true },
}
