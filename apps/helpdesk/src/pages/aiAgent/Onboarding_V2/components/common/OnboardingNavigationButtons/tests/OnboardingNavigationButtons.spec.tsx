import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OnboardingNavigationButtons } from '../OnboardingNavigationButtons'

describe('OnboardingNavigationButtons', () => {
    const defaultProps = {
        step: 1,
        totalSteps: 3,
        onBackClick: jest.fn(),
        onNextClick: jest.fn(),
        isLoading: false,
    }

    it('renders correctly with initial step', () => {
        render(<OnboardingNavigationButtons {...defaultProps} />)

        expect(screen.getByText('Next')).toBeInTheDocument()
        // on the initial step there is no back button
        expect(screen.queryByText('Back')).not.toBeInTheDocument()
    })

    it('shows both back and next buttons for middle step', () => {
        render(<OnboardingNavigationButtons {...defaultProps} step={2} />)

        expect(screen.getByText('Back')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('shows "Finish setup" instead of "Next" on final step', () => {
        render(
            <OnboardingNavigationButtons
                {...defaultProps}
                step={3}
                totalSteps={3}
            />,
        )

        expect(screen.getByText('Finish setup')).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('calls onBackClick when back button is clicked', async () => {
        render(<OnboardingNavigationButtons {...defaultProps} step={2} />)

        await act(() => userEvent.click(screen.getByText('Back')))

        expect(defaultProps.onBackClick).toHaveBeenCalledTimes(1)
    })

    it('calls onNextClick when next button is clicked', async () => {
        render(<OnboardingNavigationButtons {...defaultProps} />)

        await act(() => userEvent.click(screen.getByText('Next')))

        expect(defaultProps.onNextClick).toHaveBeenCalledTimes(1)
    })
})
