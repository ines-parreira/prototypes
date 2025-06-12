import React from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { OnboardingCard } from './OnboardingCard'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
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

        await userEvent.click(screen.getByText('This is a placeholder button'))

        expect(mockHistoryPush).toHaveBeenCalledTimes(1)
    })
})
