import type { ComponentProps } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { InvoiceCadence } from '@gorgias/helpdesk-types'

import type {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    SMSOrVoicePlan,
} from 'models/billing/types'
import { Cadence, HelpdeskPlanTier, ProductType } from 'models/billing/types'

import CancelProductModal from './CancelProductModal'

// Mock plans
const mockHelpdeskPlan: HelpdeskPlan = {
    product: ProductType.Helpdesk,
    num_quota_tickets: 300,
    amount: 30000,
    currency: 'USD',
    custom: false,
    extra_ticket_cost: 40,
    plan_id: 'pro_plan',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'Pro',
    public: true,
    integrations: 100,
    is_legacy: false,
    features: {} as any,
    tier: HelpdeskPlanTier.PRO,
}

const mockAutomatePlan: AutomatePlan = {
    product: ProductType.Automation,
    num_quota_tickets: 100,
    amount: 10000,
    currency: 'USD',
    custom: false,
    extra_ticket_cost: 10,
    plan_id: 'automate_starter',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'Starter',
    public: true,
    features: {} as any,
}

const mockVoicePlan: SMSOrVoicePlan = {
    product: ProductType.Voice,
    num_quota_tickets: 50,
    amount: 5000,
    currency: 'USD',
    custom: false,
    extra_ticket_cost: 10,
    plan_id: 'voice_plan',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'Voice Plan',
    public: true,
}

const mockSMSPlan: SMSOrVoicePlan = {
    product: ProductType.SMS,
    num_quota_tickets: 25,
    amount: 2500,
    currency: 'USD',
    custom: false,
    extra_ticket_cost: 10,
    plan_id: 'sms_plan',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'SMS Plan',
    public: true,
}

const mockConvertPlan: ConvertPlan = {
    product: ProductType.Convert,
    num_quota_tickets: 50,
    amount: 7500,
    currency: 'USD',
    custom: false,
    extra_ticket_cost: 0,
    plan_id: 'convert_plan',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'Convert Plan',
    public: true,
}

const mockStoreCreator = configureStore([])

const storyConfig: Meta<typeof CancelProductModal> = {
    title: 'Billing/CancelProductModal',
    component: CancelProductModal,
    parameters: {
        docs: {
            description: {
                component:
                    'Product cancellation modal that guides users through the cancellation flow with multiple steps: ProductFeaturesFOMO, CancellationReasons, ChurnMitigationOffer (if applicable), and CancellationSummary. Use these stories to validate cancellation copy for all products.',
            },
            story: {
                inline: false,
                iframeHeight: 600,
            },
        },
    },
    decorators: [
        (Story) => {
            // Create fresh instances for each render
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                    },
                },
            })

            const store = mockStoreCreator({
                currentUser: fromJS({
                    id: 1,
                    email: 'test@example.com',
                    name: 'Test User',
                    settings: [],
                }),
                currentAccount: fromJS({
                    domain: 'test-account.gorgias.com',
                    is_trialing: false,
                    products: {
                        [ProductType.Helpdesk]: 'pro_plan',
                        [ProductType.Automation]: 'automate_starter',
                    },
                }),
                billing: fromJS({
                    products: [
                        {
                            type: ProductType.Helpdesk,
                            prices: [mockHelpdeskPlan],
                        },
                        {
                            type: ProductType.Automation,
                            prices: [mockAutomatePlan],
                        },
                        {
                            type: ProductType.Voice,
                            prices: [mockVoicePlan],
                        },
                        {
                            type: ProductType.SMS,
                            prices: [mockSMSPlan],
                        },
                        {
                            type: ProductType.Convert,
                            prices: [mockConvertPlan],
                        },
                    ],
                    invoices: [],
                }),
            })

            return (
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <Story />
                    </QueryClientProvider>
                </Provider>
            )
        },
    ],
    argTypes: {
        onClose: {
            action: 'closed',
        },
        updateSubscription: {
            action: 'updateSubscription',
        },
        onCancellationConfirmed: {
            action: 'cancellationConfirmed',
        },
    },
    tags: ['autodocs'],
}

type Story = StoryObj<typeof CancelProductModal>

const defaultProps: Partial<ComponentProps<typeof CancelProductModal>> = {
    isOpen: true,
    periodEnd: '2026-02-15',
    setSelectedPlans: () => {},
    updateSubscription: async () => Promise.resolve(),
}

export const HelpdeskCancellation: Story = {
    args: {
        ...defaultProps,
        productType: ProductType.Helpdesk,
        subscriptionProducts: {
            [ProductType.Helpdesk]: mockHelpdeskPlan,
            [ProductType.Automation]: mockAutomatePlan,
            [ProductType.Voice]: null,
            [ProductType.SMS]: null,
            [ProductType.Convert]: null,
        },
        selectedPlans: {
            [ProductType.Helpdesk]: {
                plan: mockHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: mockAutomatePlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: undefined,
                isSelected: false,
            },
            [ProductType.SMS]: {
                plan: undefined,
                isSelected: false,
            },
            [ProductType.Convert]: {
                plan: undefined,
                isSelected: false,
            },
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Cancellation flow for Helpdesk product. Shows features like "Your all-in-one inbox", "Your ecommerce dashboard", and "Your 100+ ecommerce integrations". Navigate through all steps to validate cancellation reasons copy.',
            },
        },
    },
}

export const AIAgentCancellation: Story = {
    args: {
        ...defaultProps,
        productType: ProductType.Automation,
        subscriptionProducts: {
            [ProductType.Helpdesk]: mockHelpdeskPlan,
            [ProductType.Automation]: mockAutomatePlan,
            [ProductType.Voice]: null,
            [ProductType.SMS]: null,
            [ProductType.Convert]: null,
        },
        selectedPlans: {
            [ProductType.Helpdesk]: {
                plan: mockHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: mockAutomatePlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: undefined,
                isSelected: false,
            },
            [ProductType.SMS]: {
                plan: undefined,
                isSelected: false,
            },
            [ProductType.Convert]: {
                plan: undefined,
                isSelected: false,
            },
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Cancellation flow for AI Agent product. Shows features like "Autonomous ticket resolution", "Actions across 100+ ecommerce tools", and "Revenue-generating conversations". Validate AI Agent specific copy and cancellation reasons.',
            },
        },
    },
}

export const VoiceCancellation: Story = {
    args: {
        ...defaultProps,
        productType: ProductType.Voice,
        subscriptionProducts: {
            [ProductType.Helpdesk]: mockHelpdeskPlan,
            [ProductType.Automation]: mockAutomatePlan,
            [ProductType.Voice]: mockVoicePlan,
            [ProductType.SMS]: null,
            [ProductType.Convert]: null,
        },
        selectedPlans: {
            [ProductType.Helpdesk]: {
                plan: mockHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: mockAutomatePlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: mockVoicePlan,
                isSelected: true,
            },
            [ProductType.SMS]: {
                plan: undefined,
                isSelected: false,
            },
            [ProductType.Convert]: {
                plan: undefined,
                isSelected: false,
            },
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Cancellation flow for Voice product. Highlights features like "Unified phone support with full customer context", "Shopify-powered call handling", and "AI transcripts and call analytics". Validate Voice specific copy.',
            },
        },
    },
}

export const SMSCancellation: Story = {
    args: {
        ...defaultProps,
        productType: ProductType.SMS,
        subscriptionProducts: {
            [ProductType.Helpdesk]: mockHelpdeskPlan,
            [ProductType.Automation]: mockAutomatePlan,
            [ProductType.Voice]: null,
            [ProductType.SMS]: mockSMSPlan,
            [ProductType.Convert]: null,
        },
        selectedPlans: {
            [ProductType.Helpdesk]: {
                plan: mockHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: mockAutomatePlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: undefined,
                isSelected: false,
            },
            [ProductType.SMS]: {
                plan: mockSMSPlan,
                isSelected: true,
            },
            [ProductType.Convert]: {
                plan: undefined,
                isSelected: false,
            },
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Cancellation flow for SMS product. Shows features like "98% open rate — 5x higher than email", "Automated replies powered by Shopify data", and "73% of shoppers buy after receiving a text". Validate SMS copy.',
            },
        },
    },
}

export const ConvertCancellation: Story = {
    args: {
        ...defaultProps,
        productType: ProductType.Convert,
        subscriptionProducts: {
            [ProductType.Helpdesk]: mockHelpdeskPlan,
            [ProductType.Automation]: mockAutomatePlan,
            [ProductType.Voice]: null,
            [ProductType.SMS]: null,
            [ProductType.Convert]: mockConvertPlan,
        },
        selectedPlans: {
            [ProductType.Helpdesk]: {
                plan: mockHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: mockAutomatePlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: undefined,
                isSelected: false,
            },
            [ProductType.SMS]: {
                plan: undefined,
                isSelected: false,
            },
            [ProductType.Convert]: {
                plan: mockConvertPlan,
                isSelected: true,
            },
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Cancellation flow for Convert product. Features include "Up to 49% more sales on targeted products", "Advanced targeting with Shopify data", and "Direct connection to live support". Validate Convert copy.',
            },
        },
    },
}

export default storyConfig
