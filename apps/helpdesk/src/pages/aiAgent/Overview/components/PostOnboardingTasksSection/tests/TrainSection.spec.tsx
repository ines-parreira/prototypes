import React from 'react'

import { render, screen } from '@testing-library/react'

import { TrainSection } from '../TrainSection'
import { PostOnboardingTask } from '../types'

describe('TrainSection', () => {
    const mockTask: PostOnboardingTask = {
        stepName: 'TRAIN',
        stepTitle: 'Train AI Agent',
        stepDescription: 'This is a test description for training',
        stepImage: 'test-image-url',
    }

    it('renders the component with correct description', () => {
        render(<TrainSection task={mockTask} />)

        expect(screen.getByText(mockTask.stepDescription)).toBeInTheDocument()
    })

    it('renders the image with correct src and alt text', () => {
        render(<TrainSection task={mockTask} />)

        const image = screen.getByAltText('AI Agent training')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', mockTask.stepImage)
    })

    it('renders the Add Guidance button', () => {
        render(<TrainSection task={mockTask} />)

        expect(screen.getByText('Add Guidance')).toBeInTheDocument()
    })
})
