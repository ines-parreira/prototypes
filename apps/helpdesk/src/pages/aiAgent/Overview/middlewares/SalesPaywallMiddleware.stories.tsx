import type React from 'react'
import type { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import type { Meta, StoryObj } from '@storybook/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { UserRole } from 'config/types/user'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { shopifyIntegration } from 'fixtures/integrations'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
} from 'fixtures/productPrices'
import { user } from 'fixtures/users'
import { SubscriptionStatus } from 'models/billing/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { AppContextProvider } from 'pages/AppContext'
import { CompanyTier } from 'state/currentCompany/currentCompanySlice'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { SalesPaywallMiddleware } from './SalesPaywallMiddleware'

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

const mockComponent: React.FC = () => <div />

const storyConfig: Meta<typeof SalesPaywallMiddleware> = {
    title: 'Billing/Legacy/Pages/SalesPaywallMiddleware',
    component: SalesPaywallMiddleware(mockComponent),
    argTypes: {},
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
                                    : basicMonthlyAutomationPlan.price_id,
                        },
                    },
                }),
                currentCompany: {
                    fixed_gmv_band: parameters.fixed_gmv_band,
                },
            }
            return (
                <MemoryRouter>
                    <AppContextProvider>
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore(storeState)}>
                                <Story />
                            </Provider>
                        </QueryClientProvider>
                    </AppContextProvider>
                </MemoryRouter>
            )
        },
    ],
}

type Props = ComponentProps<ReturnType<typeof SalesPaywallMiddleware>>
type Story = StoryObj<typeof SalesPaywallMiddleware>

const templateParameters = {
    controls: {
        include: [] satisfies (keyof Props)[],
    },
    flags: {
        [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
        [FeatureFlagKey.AiAgentExpandingTrialExperienceForAll]: true,
        [FeatureFlagKey.ShoppingAssistantTrialRevampMilestone]: 'milestone-1',
    },
}

const defaultProps: Props = {}

export const SMB1_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier1,
    },
}

export const SMB2_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier2,
    },
}

export const Commercial1_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier3,
    },
}

export const Commercial2_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier4,
    },
}

export const Enterprise1_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier5,
    },
}

export const Enterprise2_Admin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier6,
    },
}

export const SMB1_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier1,
    },
}

export const SMB2_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier2,
    },
}

export const Commercial1_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier3,
    },
}

export const Commercial2_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier4,
    },
}

export const Enterprise1_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier5,
    },
}

export const Enterprise2_Admin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Admin,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier6,
    },
}

export const SMB1_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier1,
    },
}

export const SMB2_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier2,
    },
}

export const Commercial1_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier3,
    },
}

export const Commercial2_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier4,
    },
}

export const Enterprise1_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier5,
    },
}

export const Enterprise2_NonAdmin_AIAgent: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.AiAgent,
        fixed_gmv_band: CompanyTier.Tier6,
    },
}

export const SMB1_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier1,
    },
}

export const SMB2_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier2,
    },
}

export const Commercial1_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier3,
    },
}

export const Commercial2_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier4,
    },
}

export const Enterprise1_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier5,
    },
}

export const Enterprise2_NonAdmin_ShoppingAssistant: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
        userRole: UserRole.Agent,
        trialType: TrialType.ShoppingAssistant,
        fixed_gmv_band: CompanyTier.Tier6,
    },
}

export default storyConfig
