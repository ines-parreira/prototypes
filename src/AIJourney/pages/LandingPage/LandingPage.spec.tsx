import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { LandingPage } from './LandingPage'

describe('<LandingPage />', () => {
    it('should render AI Journey landing page', () => {
        renderWithRouter(<LandingPage />)

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })
})
