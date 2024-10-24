import {screen, render} from '@testing-library/react'
import React from 'react'

import {RecommendationDisabled} from '../TrainMyAiAlerts'

describe('<TrainMyAiAlerts />', () => {
    it('should render component', () => {
        render(<RecommendationDisabled link="" />)

        expect(
            screen.getByText(/article recommendation is disabled in/i)
        ).toBeInTheDocument()
    })
})
