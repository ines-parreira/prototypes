import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { LandingPage } from './LandingPage'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('<LandingPage />', () => {
    it('should render AI Journey landing page', () => {
        renderWithRouter(<LandingPage />)

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })
    it('should redirect to conversation-setup page when placeholder button is clicked', () => {
        renderWithRouter(<LandingPage />)

        const placeholderButton = screen.getByText(
            'This is a placeholder button',
        )
        expect(placeholderButton).toBeInTheDocument()
        placeholderButton.click()

        expect(mockHistoryPush).toHaveBeenCalledTimes(1)
    })
})
