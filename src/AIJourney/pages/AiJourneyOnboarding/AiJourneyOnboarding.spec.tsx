import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { AiJourneyOnboarding } from './AiJourneyOnboarding'

describe('<AiJourneyOnboarding />', () => {
    it('should render AI Journey landing page', () => {
        renderWithRouter(<AiJourneyOnboarding />)

        expect(
            screen.getByText('This is a placeholder button'),
        ).toBeInTheDocument()
    })
})
