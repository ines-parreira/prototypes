import type { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { UserRole } from 'config/types/user'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { shopifyIntegration } from 'fixtures/integrations'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
} from 'fixtures/plans'
import { user } from 'fixtures/users'
import { trialsKeys } from 'models/aiAgent/queries'
import type { ResponseTrial } from 'models/aiAgent/types'
import { SubscriptionStatus } from 'models/billing/types'
import { CompanyTier } from 'state/currentCompany/currentCompanySlice'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { ShoppingAssistantPromoCard } from './ShoppingAssistantPromoCard'
import { TrialType } from './types/ShoppingAssistant'

const defaultState = {
    currentUser: fromJS(user),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            status: SubscriptionStatus.ACTIVE,
        },
    }),
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const queryClient = mockQueryClient()
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const storyConfig: Meta<typeof ShoppingAssistantPromoCard> = {
    title: 'Billing/Legacy/Pages/ShoppingAssistantPromoCard',
    component: ShoppingAssistantPromoCard,
    argTypes: {
        className: {
            control: {
                type: 'text',
            },
        },
    },
    decorators: [
        (Story, { parameters }) => {
            const storeState = {
                ...defaultState,
                currentUser: fromJS({
                    ...user,
                    role: { name: parameters.userRole },
                }),
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        status: SubscriptionStatus.ACTIVE,
                        products: {
                            ...account.current_subscription.products,
                            [AUTOMATION_PRODUCT_ID]:
                                parameters.trialType === TrialType.AiAgent
                                    ? undefined
                                    : basicMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
                currentCompany: {
                    fixed_gmv_band: parameters.fixed_gmv_band,
                },
            }

            queryClient.setQueryData(trialsKeys.list(account.domain), {
                data: [] satisfies ResponseTrial[],
            })

            return (
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(storeState)}>
                            <Story />
                        </Provider>
                    </QueryClientProvider>
                </MemoryRouter>
            )
        },
    ],
}

type Props = ComponentProps<typeof ShoppingAssistantPromoCard>
type Story = StoryObj<typeof ShoppingAssistantPromoCard>

const templateParameters = {
    controls: {
        include: ['className'] satisfies (keyof Props)[],
    },
    flags: {
        [FeatureFlagKey.ShoppingAssistantTrialImprovement]: true,
        [FeatureFlagKey.AiAgentExpandingTrialExperienceForAll]: true,
    },
}

const defaultProps: Props = {
    className: '',
}

export const SMB_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Band1,
    },
}

export const SMB_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Band1,
    },
}

export const Commercial_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Band2,
    },
}

export const Commercial_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Band2,
    },
}

export const Enterprise_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Band3,
    },
}

export const Enterprise_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Band3,
    },
}

export const NamedAccounts_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Band4,
    },
}

export const NamedAccounts_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Band4,
    },
}

export const SMB_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Band1,
    },
}

export const SMB_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Band1,
    },
}

export const Commercial_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Band2,
    },
}

export const Commercial_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Band2,
    },
}

export const Enterprise_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Band3,
    },
}

export const Enterprise_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Band3,
    },
}

export const NamedAccounts_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Band4,
    },
}

export const NamedAccounts_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Band4,
    },
}

export default storyConfig
