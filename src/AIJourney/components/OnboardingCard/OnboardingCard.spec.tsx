import React from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { OnboardingCard } from './OnboardingCard'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('<OnboardingCard />', () => {
    it('should redirect from conversation setup to activation', async () => {
        render(<OnboardingCard currentStep={'Conversation Setup'} />)
        expect(screen.getByText('Conversation Setup step')).toBeInTheDocument()

        const placeholderButton = screen.getByText(
            'This is a placeholder button',
        )
        expect(placeholderButton).toBeInTheDocument()
        await userEvent.click(placeholderButton)

        expect(mockHistoryPush).toHaveBeenCalledTimes(1)
    })
})
