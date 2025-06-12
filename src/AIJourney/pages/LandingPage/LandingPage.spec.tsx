import { screen } from '@testing-library/react'
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

        const placeholderButton = screen.getByText(
            'This is a placeholder button',
        )
        expect(placeholderButton).toBeInTheDocument()
        await userEvent.click(placeholderButton)

        expect(mockHistoryPush).toHaveBeenCalledTimes(1)
    })
})
