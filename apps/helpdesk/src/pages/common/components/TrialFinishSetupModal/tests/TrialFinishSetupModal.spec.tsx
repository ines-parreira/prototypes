import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TrialFinishSetupModal from '../TrialFinishSetupModal'

jest.mock('assets/img/icons/check.svg', () => 'check.svg')
jest.mock('assets/img/icons/bolt.svg', () => 'bolt.svg')

const defaultProps = {
    title: 'Ready. Set. Grow. Your 14-days trial starts now.',
    subtitle: "Let's unlock its full potential.",
    content:
        'Just two simple steps to increase conversions and make the most of your trial.',
    isOpen: true,
    onClose: jest.fn(),
    primaryAction: {
        label: 'Finish setup',
        onClick: jest.fn(),
    },
    secondaryAction: {
        label: 'Close',
        onClick: jest.fn(),
    },
    isLoading: false,
}

describe('<TrialFinishSetupModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal when isOpen is true', () => {
        render(<TrialFinishSetupModal {...defaultProps} />)

        expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
        expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument()
        expect(screen.getByText(defaultProps.content)).toBeInTheDocument()
    })

    it('does not render the modal when isOpen is false', () => {
        render(<TrialFinishSetupModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
    })

    it('renders all feature cards with their titles and descriptions', () => {
        render(<TrialFinishSetupModal {...defaultProps} />)

        expect(
            screen.getByText('Shopping Assistant features are now live!'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Turn on customer engagement tools'),
        ).toBeInTheDocument()
        expect(screen.getByText('Set up discount strategy')).toBeInTheDocument()

        expect(
            screen.getByText(
                'All features are unlocked, so you can start seeing impact today.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Proactively engage with visitors and instantly drive meaningful conversations.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Offer smart discounts to maximize conversions.'),
        ).toBeInTheDocument()
    })

    it('renders benefit text for features that have them', () => {
        render(<TrialFinishSetupModal {...defaultProps} />)

        expect(
            screen.getByText('Brands that enable this see 15% more sales'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Reduce cart abandonment with timely offers'),
        ).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', async () => {
        const user = userEvent.setup()
        render(<TrialFinishSetupModal {...defaultProps} />)

        const closeButton = screen.getByRole('button', {
            name: defaultProps.secondaryAction.label,
        })
        await user.click(closeButton)

        expect(defaultProps.secondaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('calls primaryAction.onClick when primary button is clicked', async () => {
        const user = userEvent.setup()
        render(<TrialFinishSetupModal {...defaultProps} />)

        const primaryButton = screen.getByRole('button', {
            name: defaultProps.primaryAction.label,
        })
        await user.click(primaryButton)

        expect(defaultProps.primaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('calls secondaryAction.onClick when secondary button is clicked', async () => {
        const user = userEvent.setup()
        render(<TrialFinishSetupModal {...defaultProps} />)

        const secondaryButton = screen.getByRole('button', {
            name: defaultProps.secondaryAction.label,
        })
        await user.click(secondaryButton)

        expect(defaultProps.secondaryAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('renders action buttons in the footer', () => {
        render(<TrialFinishSetupModal {...defaultProps} />)

        const primaryButton = screen.getByRole('button', {
            name: defaultProps.primaryAction.label,
        })
        const secondaryButton = screen.getByRole('button', {
            name: defaultProps.secondaryAction.label,
        })

        expect(primaryButton).toBeInTheDocument()
        expect(secondaryButton).toBeInTheDocument()
    })
    it('renders without secondaryAction when not provided', () => {
        const propsWithoutSecondaryAction = {
            ...defaultProps,
            secondaryAction: undefined,
        }

        render(<TrialFinishSetupModal {...propsWithoutSecondaryAction} />)

        expect(
            screen.queryByRole('button', { name: 'Remind me later' }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Finish setup' }),
        ).toBeInTheDocument()
    })
})
