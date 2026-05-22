import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { action } from 'storybook/actions'

import { trialsKeys } from 'models/aiAgent/queries'
import type { Trial } from 'models/aiAgent/types'
import { aiAgentGen6PlanQuery } from 'models/billing/queries'
import { Cadence } from 'models/billing/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import type { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'

import { TrialActivationModal } from './TrialActivationModal'

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

const createOptedInTrial = (expired: boolean = false): Trial =>
    ({
        shopType: 'shopify',
        shopName: 'storybook-shop',
        type: TrialType.AiAgent,
        trial: {
            startDatetime: '2024-01-01T00:00:00Z',
            endDatetime: '2024-01-15T00:00:00Z',
            account: {
                optInDatetime: '2024-01-01T00:00:00Z',
                optOutDatetime: null,
                plannedUpgradeDatetime: null,
                actualUpgradeDatetime: null,
                actualTerminationDatetime: expired
                    ? '2024-01-14T00:00:00Z'
                    : null,
            },
        },
    }) as Trial

type DecoratorOptions = {
    upgradePlan?: unknown
    trials?: Trial[]
}

const buildDecorator =
    ({ upgradePlan = STORY_UPGRADE_PLAN, trials = [] }: DecoratorOptions) =>
    (Story: () => JSX.Element) => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })

        queryClient.setQueryData(aiAgentGen6PlanQuery.queryKey, {
            plan: upgradePlan,
        })
        queryClient.setQueryData(trialsKeys.list(STORYBOOK_DOMAIN), trials)

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

const meta: Meta<typeof TrialActivationModal> = {
    title: 'AI Agent/Trial/TrialActivationModal',
    component: TrialActivationModal,
    parameters: { layout: 'centered' },
    args: {
        isOpen: true,
        onClose: action('onClose'),
        onConfirm: action('onConfirm'),
        newPlan: STORY_NEW_PLAN,
        isLoading: false,
    },
}

export default meta

type Story = StoryObj<typeof TrialActivationModal>

export const AiAgentTrial: Story = {
    name: 'AI Agent trial (shoppers)',
    args: { trialType: TrialType.AiAgent },
    decorators: [buildDecorator({})],
}

export const ShoppingAssistantTrial: Story = {
    name: 'Shopping Assistant trial (customers)',
    args: { trialType: TrialType.ShoppingAssistant },
    decorators: [buildDecorator({})],
}

export const PreOptedInTrial: Story = {
    name: 'Pre-opted-in (ToS auto-checked)',
    args: { trialType: TrialType.AiAgent },
    decorators: [buildDecorator({ trials: [createOptedInTrial()] })],
}

export const Loading: Story = {
    name: 'Loading state',
    args: { trialType: TrialType.AiAgent, isLoading: true },
    decorators: [buildDecorator({})],
}

export const ContactUsFallback: Story = {
    name: 'No upgrade plan → contact-us fallback',
    args: { trialType: TrialType.AiAgent },
    decorators: [buildDecorator({ upgradePlan: null })],
}
