import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import OnboardingProgressTracker from '../OnboardingProgressTracker'

describe('OnboardingProgressTracker', () => {
    const defaultProps = {
        step: 1,
        totalSteps: 3,
        onBackClick: jest.fn(),
        onNextClick: jest.fn(),
        isLoading: false,
    }

    it('renders correctly with initial step', () => {
        render(<OnboardingProgressTracker {...defaultProps} />)

        expect(screen.getByText('Next')).toBeInTheDocument()
        // on the initial step there is no back button
        expect(screen.queryByText('Back')).not.toBeInTheDocument()
    })

    it('shows both back and next buttons for middle step', () => {
        render(<OnboardingProgressTracker {...defaultProps} step={2} />)

        expect(screen.getByText('Back')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('shows "Finish" instead of "Next" on final step', () => {
        render(
            <OnboardingProgressTracker
                {...defaultProps}
                step={3}
                totalSteps={3}
            />,
        )

        expect(screen.getByText('Finish')).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('calls onBackClick when back button is clicked', () => {
        render(<OnboardingProgressTracker {...defaultProps} step={2} />)

        fireEvent.click(screen.getByText('Back'))

        expect(defaultProps.onBackClick).toHaveBeenCalledTimes(1)
    })

    it('calls onNextClick when next button is clicked', () => {
        render(<OnboardingProgressTracker {...defaultProps} />)

        fireEvent.click(screen.getByText('Next'))

        expect(defaultProps.onNextClick).toHaveBeenCalledTimes(1)
    })
})
