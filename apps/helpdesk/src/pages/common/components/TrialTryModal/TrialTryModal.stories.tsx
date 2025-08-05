import React from 'react'

import { Meta, StoryObj } from '@storybook/react'

import { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'

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
    billingPeriod: 'month',
    priceTooltipText: 'Billed monthly at $50 per seat',
} as unknown as PlanDetails

const newPlan = {
    name: 'Pro',
    price: '$100',
    billingPeriod: 'month',
    priceTooltipText: 'Billed monthly at $100 per seat',
} as unknown as PlanDetails

const TRIAL_TITLE = 'Unlock new AI Agent skills at no extra cost'
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
    },
}
