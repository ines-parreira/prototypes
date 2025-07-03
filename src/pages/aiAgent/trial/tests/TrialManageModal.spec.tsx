import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TrialManageModal } from '../components/TrialManageModal/TrialManageModal'

describe('TrialManageModal', () => {
    const defaultProps = {
        title: 'Trial Ending Soon',
        description: 'Your trial will end tomorrow.',
        advantages: ['$2,034 GMV uplift', 'Priority support'],
        onClose: jest.fn(),
        primaryAction: {
            label: 'Upgrade Now',
            onClick: jest.fn(),
        },
        secondaryAction: {
            label: 'Remind Me Later',
            onClick: jest.fn(),
        },
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders modal with correct title and description', () => {
        render(<TrialManageModal {...defaultProps} />)
        expect(screen.getByText('Trial Ending Soon')).toBeInTheDocument()
        expect(
            screen.getByText('Your trial will end tomorrow.'),
        ).toBeInTheDocument()
    })

    it('renders all advantages', () => {
        render(<TrialManageModal {...defaultProps} />)
        expect(screen.getByText('$2,034 GMV uplift')).toBeInTheDocument()
        expect(screen.getByText('Priority support')).toBeInTheDocument()
    })

    it('renders primary and secondary action buttons', () => {
        render(<TrialManageModal {...defaultProps} />)
        expect(
            screen.getByRole('button', { name: 'Upgrade Now' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Remind Me Later' }),
        ).toBeInTheDocument()
    })

    it('calls onClose when modal close is triggered', async () => {
        const user = userEvent.setup()
        render(<TrialManageModal {...defaultProps} />)
        const closeButton = screen.getByRole('button', { name: /close/i })
        await user.click(closeButton)
        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls primaryAction.onClick when primary button is clicked', async () => {
        const user = userEvent.setup()
        render(<TrialManageModal {...defaultProps} />)
        const primaryButton = screen.getByRole('button', {
            name: 'Upgrade Now',
        })
        await user.click(primaryButton)
        expect(defaultProps.primaryAction.onClick).toHaveBeenCalled()
    })

    it('calls secondaryAction.onClick when secondary button is clicked', async () => {
        const user = userEvent.setup()
        render(<TrialManageModal {...defaultProps} />)
        const secondaryButton = screen.getByRole('button', {
            name: 'Remind Me Later',
        })
        await user.click(secondaryButton)
        expect(defaultProps.secondaryAction.onClick).toHaveBeenCalled()
    })

    it('disables primary button when isDisabled is true', () => {
        render(
            <TrialManageModal
                {...defaultProps}
                primaryAction={{
                    ...defaultProps.primaryAction,
                    isDisabled: true,
                }}
            />,
        )
        expect(
            screen.getByRole('button', { name: 'Upgrade Now' }),
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('shows loading state for primary and secondary buttons', () => {
        render(
            <TrialManageModal
                {...defaultProps}
                primaryAction={{
                    ...defaultProps.primaryAction,
                    isLoading: true,
                }}
                secondaryAction={{
                    ...defaultProps.secondaryAction,
                    isLoading: true,
                }}
            />,
        )
        // The button label may change or a spinner may be present, so check for aria-disabled and spinner
        expect(
            screen.getByRole('button', { name: /Upgrade Now/ }),
        ).toHaveAttribute('aria-disabled', 'true')
        expect(
            screen.getByRole('button', { name: /Remind Me Later/ }),
        ).toHaveAttribute('aria-disabled', 'true')
        // Optionally, check for loading spinner (role=status)
        expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(2)
    })

    it('does not render secondary button if secondaryAction is not provided', () => {
        render(
            <TrialManageModal {...defaultProps} secondaryAction={undefined} />,
        )
        expect(
            screen.queryByRole('button', { name: 'Remind Me Later' }),
        ).not.toBeInTheDocument()
    })

    it('does not render primary button if primaryAction is not provided', () => {
        render(<TrialManageModal {...defaultProps} primaryAction={undefined} />)
        expect(
            screen.queryByRole('button', { name: 'Upgrade Now' }),
        ).not.toBeInTheDocument()
    })
})
