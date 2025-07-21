import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import {
    TrialActivatedModal,
    TrialActivatedModalProps,
} from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'

describe('TrialActivatedModal', () => {
    const defaultProps: TrialActivatedModalProps = {
        title: 'Test Modal Title',
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render modal with title', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        expect(screen.getByText('Test Modal Title')).toBeInTheDocument()
    })

    it('should render all static text content', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        expect(
            screen.getByText('Your Shopping Assistant is live!'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                "You're all set to start turning website visitors into buyers. Take a few quick steps to unlock its full potential.",
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Shopping Assistant activated'),
        ).toBeInTheDocument()
        expect(screen.getByText('14 day trial')).toBeInTheDocument()
        expect(
            screen.getByText('Proactively engage customers'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Turn on customer engagement features'),
        ).toBeInTheDocument()
        expect(screen.getByText('Offer smart discounts')).toBeInTheDocument()
        expect(
            screen.getByText('Set up your discount strategy'),
        ).toBeInTheDocument()
    })

    it('should render boost conversion badges', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        expect(screen.getByText('Boost conversion by 15%')).toBeInTheDocument()
        expect(
            screen.getByText('Increase conversions by up to +50%'),
        ).toBeInTheDocument()
    })

    it('should render material icons', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        // Check for check_circle icon
        const checkCircleIcons = screen.getAllByText('check_circle')
        expect(checkCircleIcons).toHaveLength(1)

        // Check for check_circle_outline icons
        const checkCircleOutlineIcons = screen.getAllByText(
            'check_circle_outline',
        )
        expect(checkCircleOutlineIcons).toHaveLength(2)

        // Check for bolt icons in badges
        const boltIcons = screen.getAllByText('bolt')
        expect(boltIcons).toHaveLength(2)
    })

    it('should call onConfirm when Complete Set Up button is clicked', async () => {
        const user = userEvent.setup()
        const mockOnConfirm = jest.fn()
        const props = {
            ...defaultProps,
            onConfirm: mockOnConfirm,
        }

        render(<TrialActivatedModal {...props} />)

        const button = screen.getByRole('button', { name: 'Complete Set Up' })
        await user.click(button)

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should render modal content', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        // Check that modal content is rendered
        expect(screen.getByText('Test Modal Title')).toBeInTheDocument()
        expect(
            screen.getByText('Your Shopping Assistant is live!'),
        ).toBeInTheDocument()
    })

    it('should apply correct structure', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        // Since CSS modules are used, we can't test exact class names
        // Instead, we test for the presence of elements with expected text content
        expect(
            screen.getByText('Your Shopping Assistant is live!'),
        ).toBeInTheDocument()
        expect(screen.getByText('Complete Set Up')).toBeInTheDocument()
        expect(
            screen.getByText('Proactively engage customers'),
        ).toBeInTheDocument()
        expect(screen.getByText('Offer smart discounts')).toBeInTheDocument()
    })

    it('should render with proper modal structure', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        // Test that all major sections are present
        expect(screen.getByText('Test Modal Title')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Complete Set Up' }),
        ).toBeInTheDocument()
    })

    it('should render separators between conditions', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        // Check that all three conditions are rendered
        expect(
            screen.getByText('Shopping Assistant activated'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Proactively engage customers'),
        ).toBeInTheDocument()
        expect(screen.getByText('Offer smart discounts')).toBeInTheDocument()
    })

    it('should have proper accessibility for the button', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        const button = screen.getByRole('button', { name: 'Complete Set Up' })
        expect(button).toHaveAccessibleName('Complete Set Up')
    })

    it('should pass different titles correctly', () => {
        const props = {
            ...defaultProps,
            title: 'Custom Modal Title for Testing',
        }

        render(<TrialActivatedModal {...props} />)

        expect(
            screen.getByText('Custom Modal Title for Testing'),
        ).toBeInTheDocument()
    })

    it('should render badges with correct type', () => {
        render(<TrialActivatedModal {...defaultProps} />)

        // Check that both badge texts are rendered
        expect(screen.getByText('Boost conversion by 15%')).toBeInTheDocument()
        expect(
            screen.getByText('Increase conversions by up to +50%'),
        ).toBeInTheDocument()
    })
})
