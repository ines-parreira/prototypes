import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Cadence } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'
import type { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'

import type { TrialFeature } from './TrialTryModal'
import TrialTryModal from './TrialTryModal'

const meta: Meta<typeof TrialTryModal> = {
    title: 'Overlays/TrialTryModal',
    component: TrialTryModal,
    parameters: {
        docs: {
            description: {
                component:
                    'A modal component for requesting a trial for AI Shopping Assistant',
            },
        },
    },
    argTypes: {
        title: {
            control: { type: 'text' },
            description: 'The title of the modal',
        },
    },
}

export default meta
type Story = StoryObj<typeof TrialTryModal>

// Mock data for the stories
const currentPlan = {
    name: 'Basic',
    price: '$50',
    currency: 'USD',
    billingPeriod: Cadence.Month,
    priceTooltipText: `Billed ${getCadenceName(Cadence.Month)} at $50 per seat`,
} as unknown as PlanDetails

const newPlan = {
    name: 'Pro',
    price: '$100',
    currency: 'USD',
    billingPeriod: Cadence.Month,
    priceTooltipText: `Billed ${getCadenceName(Cadence.Month)} at $100 per seat`,
} as unknown as PlanDetails

const mockFeatures: TrialFeature[] = [
    {
        icon: 'check',
        title: 'Today',
        description:
            'Your 14-day trial has started. All shopping assistant features are unlocked, so you can start boosting conversions today.',
    },
    {
        icon: 'notifications_none',
        title: 'Day 7',
        description:
            'Mid-trial reminder: optimize your conversion strategies and explore advanced shopping features.',
    },
    {
        icon: 'star_outline',
        title: 'Day 14',
        description:
            'Your new AI Agent plan with shopping assistant features kicks in automatically to keep growing revenue.',
    },
]

const TRIAL_TITLE = 'Try out shopping assistant skills on your current plan'
const TRIAL_SUBTITLE =
    "AI Agent's new shopping assistant capabilities guide shoppers from first click to checkout, boosting conversions by up to 62% and revenue per visitor by 10%."

// Base story with common props
export const Default: Story = {
    args: {
        title: TRIAL_TITLE,
        subtitle: TRIAL_SUBTITLE,
        isOpen: true,
        onClose: () => {},
        primaryAction: {
            label: 'Start trial now',
            onClick: () => {},
        },
        secondaryAction: {
            label: 'No, thanks',
            onClick: () => {},
        },
        showTermsCheckbox: true,
        isLoading: false,
        currentPlan,
        newPlan,
        features: mockFeatures,
    },
}
