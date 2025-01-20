import {render, screen} from '@testing-library/react'
import React from 'react'

import {OnboardingSteppedSlider} from '../OnboardingSteppedSlider'

describe('OnboardingSteppedSlider', () => {
    const defaultProps = {
        steps: [
            {key: 'step1', label: 'Step 1'},
            {key: 'step2', label: 'Step 2'},
            {key: 'step3', label: 'Step 3'},
        ],
        stepKey: 'step2',
        onChange: jest.fn(),
    }

    it('renders the slider', () => {
        render(<OnboardingSteppedSlider {...defaultProps} />)

        expect(screen.getByText('Step 1')).toBeInTheDocument()
        expect(screen.getByText('Step 3')).toBeInTheDocument()
    })
})
