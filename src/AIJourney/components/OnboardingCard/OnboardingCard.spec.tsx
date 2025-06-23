import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { OnboardingCard } from './OnboardingCard'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
    useParams: () => ({
        shop_name: 'shopify-store',
    }),
}))

describe('<OnboardingCard />', () => {
    it('should render step name in card', () => {
        render(<OnboardingCard currentStep={'Conversation Setup'} />)

        expect(screen.getByText('Conversation Setup step')).toBeInTheDocument()
    })
    it('should redirect from conversation setup to activation', async () => {
        render(<OnboardingCard currentStep={'Conversation Setup'} />)
        expect(screen.getByText('Conversation Setup step')).toBeInTheDocument()

        const buttonLabel = screen.getByText('Continue')
        expect(buttonLabel).toBeInTheDocument()

        const button = screen.getByTestId('ai-journey-button')
        expect(button).toBeDisabled()

        const selectedOption = screen.getByText('1')
        await userEvent.click(selectedOption)

        expect(button).not.toBeDisabled()
        await userEvent.click(button)

        expect(mockHistoryPush).toHaveBeenCalledTimes(1)
    })
})
