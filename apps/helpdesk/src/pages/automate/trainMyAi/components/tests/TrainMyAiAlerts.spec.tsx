import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { RecommendationDisabled } from '../TrainMyAiAlerts'

describe('<TrainMyAiAlerts />', () => {
    it('should render component', () => {
        render(
            <MemoryRouter>
                <RecommendationDisabled link="" />
            </MemoryRouter>,
        )

        expect(
            screen.getByText(/article recommendation is disabled in/i),
        ).toBeInTheDocument()
    })
})
