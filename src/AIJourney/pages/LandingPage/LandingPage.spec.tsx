import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { renderWithRouter } from 'utils/testing'

import { LandingPage } from './LandingPage'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('<LandingPage />', () => {
    it('should render AI Journey landing page', () => {
        renderWithRouter(<LandingPage />)

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })
    it('should redirect to conversation-setup page when placeholder button is clicked', async () => {
        renderWithRouter(<LandingPage />)

        const buttonLabel = screen.getByText('Continue')
        expect(buttonLabel).toBeInTheDocument()

        const button = screen.getByTestId('ai-journey-button')
        await userEvent.click(button)
        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })
})
