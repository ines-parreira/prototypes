import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'

import TrialTryModal from '../TrialTryModal'

const mockCurrentPlan = {
    name: 'Basic',
    price: '$50',
    billingPeriod: 'month',
    priceTooltipText: 'Billed monthly at $50 per seat',
} as unknown as PlanDetails

const mockNewPlan = {
    name: 'Pro',
    price: '$100',
    billingPeriod: 'month',
    priceTooltipText: 'Billed monthly at $100 per seat',
} as unknown as PlanDetails

const defaultProps = {
    title: 'Unlock new AI Agent skills',
    subtitle: 'Try all Pro features for 14 days with no commitment.',
    isOpen: true,
    onClose: jest.fn(),
    primaryAction: {
        label: 'Start trial now',
        onClick: jest.fn(),
    },
    secondaryAction: {
        label: 'No, thanks',
        onClick: jest.fn(),
    },
    showTermsCheckbox: true,
    isLoading: false,
    currentPlan: mockCurrentPlan,
    newPlan: mockNewPlan,
}

describe('<TrialTryModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal when isOpen is true', () => {
        render(<TrialTryModal {...defaultProps} />)

        expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
        expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument()
    })

    it('does not render the modal when isOpen is false', () => {
        render(<TrialTryModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
    })

    it('displays current and new plan pricing information', () => {
        render(<TrialTryModal {...defaultProps} />)

        expect(screen.getByText('Current plan')).toBeInTheDocument()
        expect(
            screen.getByText(
                `${mockCurrentPlan.price} / ${mockCurrentPlan.billingPeriod}`,
            ),
        ).toBeInTheDocument()

        expect(screen.getByText('After trial ends')).toBeInTheDocument()
        expect(
            screen.getByText(
                `${mockNewPlan.price} / ${mockNewPlan.billingPeriod}`,
            ),
        ).toBeInTheDocument()
    })

    it('renders feature cards with timeline elements', () => {
        render(<TrialTryModal {...defaultProps} />)

        expect(screen.getByText('Today')).toBeInTheDocument()
        expect(screen.getByText('Day 7')).toBeInTheDocument()
        expect(screen.getByText('Day 14')).toBeInTheDocument()
    })

    it('renders terms checkbox when showTermsCheckbox is true', () => {
        render(<TrialTryModal {...defaultProps} />)

        expect(
            screen.getByText(/I agree to the updated pricing/),
        ).toBeInTheDocument()
        expect(screen.getByText('Gorgias terms')).toBeInTheDocument()
    })

    it('does not render terms checkbox when showTermsCheckbox is false', () => {
        render(<TrialTryModal {...defaultProps} showTermsCheckbox={false} />)

        expect(
            screen.queryByText(/I agree to the updated pricing/),
        ).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', async () => {
        const user = userEvent.setup()
        render(<TrialTryModal {...defaultProps} />)

        const closeButton = screen.getByRole('button', {
            name: defaultProps.secondaryAction.label,
        })
        await user.click(closeButton)

        expect(defaultProps.secondaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('handles terms checkbox interaction', async () => {
        const user = userEvent.setup()
        render(<TrialTryModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()

        await user.click(checkbox)
        expect(checkbox).toBeChecked()
    })

    it('calls primaryAction.onClick when terms are accepted and primary button is clicked', async () => {
        const user = userEvent.setup()
        render(<TrialTryModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)

        const primaryButton = screen.getByRole('button', {
            name: defaultProps.primaryAction.label,
        })
        await user.click(primaryButton)

        expect(defaultProps.primaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('does not call primaryAction.onClick when terms are not accepted', async () => {
        const user = userEvent.setup()
        render(<TrialTryModal {...defaultProps} />)

        const primaryButton = screen.getByRole('button', {
            name: defaultProps.primaryAction.label,
        })
        await user.click(primaryButton)

        expect(defaultProps.primaryAction.onClick).not.toHaveBeenCalled()
    })
})
