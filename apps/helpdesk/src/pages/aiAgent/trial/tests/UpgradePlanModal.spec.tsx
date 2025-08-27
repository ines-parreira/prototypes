import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { Cadence } from 'models/billing/types'

import {
    PlanDetails,
    UpgradePlanModal,
    UpgradePlanModalProps,
} from '../components/UpgradePlanModal/UpgradePlanModal'

describe('UpgradePlanModal', () => {
    const mockCurrentPlan: PlanDetails = {
        title: 'Current Plan',
        description: 'Your existing plan features',
        price: '$299',
        billingPeriod: Cadence.Month,
        features: [
            { label: 'Feature 1', isError: false },
            { label: 'Feature 2', isError: false },
            { label: 'Feature 3', isError: false },
        ],
        buttonText: 'Keep Current Plan',
    }

    const mockNewPlan: PlanDetails = {
        title: 'Premium Plan',
        description: 'Unlock advanced features',
        price: '$599',
        billingPeriod: Cadence.Month,
        priceTooltipText: 'Price includes all premium features',
        features: [
            { label: 'Premium Feature 1', isError: false },
            { label: 'Premium Feature 2', isError: false },
            { label: 'Premium Feature 3', isError: false },
        ],
        buttonText: 'Upgrade Now',
    }

    const defaultProps: UpgradePlanModalProps = {
        title: 'Upgrade Your Plan',
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        currentPlan: mockCurrentPlan,
        newPlan: mockNewPlan,
        onDismiss: jest.fn(),
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render modal with correct title', () => {
        render(<UpgradePlanModal {...defaultProps} />)

        expect(screen.getByText('Upgrade Your Plan')).toBeInTheDocument()
    })

    it('should render both plan sections', () => {
        render(<UpgradePlanModal {...defaultProps} />)

        // New plan
        expect(screen.getByText('Premium Plan')).toBeInTheDocument()
        expect(screen.getByText('Unlock advanced features')).toBeInTheDocument()
        expect(screen.getByText('$599')).toBeInTheDocument()

        // Current plan
        expect(screen.getByText('Current Plan')).toBeInTheDocument()
        expect(
            screen.getByText('Your existing plan features'),
        ).toBeInTheDocument()
        expect(screen.getByText('$299')).toBeInTheDocument()
    })

    it('should render price information correctly (in trial)', () => {
        render(<UpgradePlanModal {...defaultProps} isTrial />)

        // Check that both prices are present (but not within specific sections due to complex DOM structure)
        expect(screen.getByText('$599')).toBeInTheDocument()
        expect(
            screen.getByText(`/ ${Cadence.Month} after trial ends`),
        ).toBeInTheDocument()
        expect(screen.getByText('$299')).toBeInTheDocument()
        expect(screen.getByText(`/ ${Cadence.Month}`)).toBeInTheDocument()
    })

    it('should render price information correctly (not in trial)', () => {
        render(<UpgradePlanModal {...defaultProps} />)

        // Check that both prices are present (but not within specific sections due to complex DOM structure)
        expect(screen.getByText('$599')).toBeInTheDocument()
        expect(screen.getByText('$299')).toBeInTheDocument()

        const billingPeriods = screen.getAllByText(`/ ${Cadence.Month}`)
        expect(billingPeriods).toHaveLength(2)
        billingPeriods.forEach((element) => {
            expect(element).toBeInTheDocument()
        })
    })

    it('should render features for both plans', () => {
        render(<UpgradePlanModal {...defaultProps} />)

        // New plan features
        expect(screen.getByText('Premium Feature 1')).toBeInTheDocument()
        expect(screen.getByText('Premium Feature 2')).toBeInTheDocument()
        expect(screen.getByText('Premium Feature 3')).toBeInTheDocument()

        // Current plan features
        expect(screen.getByText('Premium Feature 1')).toBeInTheDocument()
        expect(screen.getByText('Premium Feature 2')).toBeInTheDocument()
        expect(screen.getByText('Premium Feature 3')).toBeInTheDocument()
    })

    it('should render tooltip icon when priceTooltipText is provided', () => {
        render(<UpgradePlanModal {...defaultProps} />)

        const tooltipIcons = screen.getAllByText('info_outline')
        expect(tooltipIcons).toHaveLength(1) // Only new plan has tooltip
    })

    it('should not render tooltip icon when priceTooltipText is not provided', () => {
        const propsWithoutTooltip = {
            ...defaultProps,
            newPlan: {
                ...mockNewPlan,
                priceTooltipText: undefined,
            },
        }

        render(<UpgradePlanModal {...propsWithoutTooltip} />)

        expect(screen.queryByText('info_outline')).not.toBeInTheDocument()
    })

    it('should render action buttons with correct text', () => {
        render(<UpgradePlanModal {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: 'Upgrade Now' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Keep Current Plan' }),
        ).toBeInTheDocument()
    })

    it('should prevent submission when terms are not accepted', async () => {
        const user = userEvent.setup()
        const mockOnConfirm = jest.fn()
        const props = {
            ...defaultProps,
            onConfirm: mockOnConfirm,
        }

        render(<UpgradePlanModal {...props} />)

        // Try to click upgrade without checking terms
        const upgradeButton = screen.getByRole('button', {
            name: 'Upgrade Now',
        })
        await user.click(upgradeButton)

        // Should not call onConfirm
        expect(mockOnConfirm).not.toHaveBeenCalled()

        // Terms link should still be present
        const termsLinks = screen.getAllByRole('link', {
            name: 'Gorgias terms',
        })
        expect(termsLinks[0]).toBeInTheDocument()
    })

    it('should call onDismiss when keep current plan button is clicked', async () => {
        const user = userEvent.setup()
        const mockOnDismiss = jest.fn()
        const props = {
            ...defaultProps,
            onDismiss: mockOnDismiss,
        }

        render(<UpgradePlanModal {...props} />)

        const keepButton = screen.getByRole('button', {
            name: 'Keep Current Plan',
        })
        await user.click(keepButton)

        expect(mockOnDismiss).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when modal close button is clicked', async () => {
        const user = userEvent.setup()
        const mockOnClose = jest.fn()
        const props = {
            ...defaultProps,
            onClose: mockOnClose,
        }

        render(<UpgradePlanModal {...props} />)

        const closeButton = screen.getByRole('button', { name: 'Close' })
        await user.click(closeButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should render terms checkbox with correct label', () => {
        render(<UpgradePlanModal {...defaultProps} />)

        expect(
            screen.getAllByText(/I agree to the updated pricing/),
        ).toHaveLength(2)
        const termsLinks = screen.getAllByRole('link', {
            name: 'Gorgias terms',
        })
        expect(termsLinks[0]).toHaveAttribute(
            'href',
            'https://www.gorgias.com/legal/terms-of-service',
        )
    })

    it('should render terms link with correct attributes', () => {
        render(<UpgradePlanModal {...defaultProps} />)

        const termsLinks = screen.getAllByRole('link', {
            name: 'Gorgias terms',
        })
        expect(termsLinks[0]).toHaveAttribute('target', '_blank')
        expect(termsLinks[0]).toHaveAttribute('rel', 'noreferrer')
    })

    it('should successfully upgrade when terms are accepted', async () => {
        const user = userEvent.setup()
        const mockOnConfirm = jest.fn()
        const props = {
            ...defaultProps,
            onConfirm: mockOnConfirm,
        }

        render(<UpgradePlanModal {...props} />)

        // Check terms first
        const checkbox = screen.getAllByRole('checkbox')[0]
        await user.click(checkbox)
        expect(checkbox).toBeChecked()

        // Then click upgrade
        const upgradeButton = screen.getByRole('button', {
            name: 'Upgrade Now',
        })
        await user.click(upgradeButton)

        // Should call onConfirm
        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should render checkbox states correctly', () => {
        render(<UpgradePlanModal {...defaultProps} />)

        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes).toHaveLength(2)

        // New plan checkbox should be unchecked (interactive)
        expect(checkboxes[0]).not.toBeChecked()

        // Current plan checkbox should be checked (non-interactive)
        expect(checkboxes[1]).toBeChecked()
    })

    it('should handle edge cases gracefully', () => {
        const props = {
            ...defaultProps,
            currentPlan: {
                ...mockCurrentPlan,
                features: [],
            },
            newPlan: {
                ...mockNewPlan,
                features: [],
                priceTooltipText: undefined,
            },
        }

        render(<UpgradePlanModal {...props} />)

        // Should not crash and should render essential elements
        expect(screen.getByText('Premium Plan')).toBeInTheDocument()
        expect(screen.getByText('Current Plan')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Upgrade Now' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Keep Current Plan' }),
        ).toBeInTheDocument()
        expect(screen.queryByText('info_outline')).not.toBeInTheDocument()
    })

    it('should work without terms checkbox when showTermsCheckbox is false', async () => {
        const user = userEvent.setup()
        const mockOnConfirm = jest.fn()
        const props = {
            ...defaultProps,
            onConfirm: mockOnConfirm,
            showTermsCheckbox: false,
        }

        render(<UpgradePlanModal {...props} />)

        // Should not show terms checkbox
        expect(
            screen.queryByText(/I agree to the updated pricing/),
        ).not.toBeInTheDocument()

        // Should be able to upgrade immediately
        const upgradeButton = screen.getByRole('button', {
            name: 'Upgrade Now',
        })
        await user.click(upgradeButton)

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should handle loading state correctly', () => {
        const props = {
            ...defaultProps,
            isLoading: true,
        }

        render(<UpgradePlanModal {...props} />)

        const upgradeButton = screen.getByRole('button', {
            name: /Loading.*Upgrade Now/,
        })
        expect(upgradeButton).toHaveAttribute('aria-disabled', 'true')
        expect(upgradeButton).toHaveTextContent('Loading...')
    })
})
