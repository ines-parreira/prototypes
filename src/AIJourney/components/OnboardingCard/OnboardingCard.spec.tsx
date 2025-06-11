import React from 'react'

import { render, screen } from '@testing-library/react'

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

        await screen.getByText('This is a placeholder button').click()

        expect(mockHistoryPush).toHaveBeenCalledTimes(1)
    })
})
