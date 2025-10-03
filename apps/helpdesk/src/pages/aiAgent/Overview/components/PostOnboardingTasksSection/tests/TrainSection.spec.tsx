import React from 'react'

import { render, screen } from '@testing-library/react'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'

import { TrainSection } from '../TrainSection'
import { PostOnboardingStepMetadata } from '../types'

describe('TrainSection', () => {
    const mockStepMetadata: PostOnboardingStepMetadata = {
        stepName: StepName.TRAIN,
        stepTitle: 'Train AI Agent',
        stepDescription: 'This is a test description for training',
        stepImage: 'test-image-url',
    }

    it('renders the component with correct description', () => {
        render(<TrainSection stepMetadata={mockStepMetadata} />)

        expect(
            screen.getByText(mockStepMetadata.stepDescription),
        ).toBeInTheDocument()
    })

    it('renders the image with correct src and alt text', () => {
        render(<TrainSection stepMetadata={mockStepMetadata} />)

        const image = screen.getByAltText('AI Agent training')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', mockStepMetadata.stepImage)
    })

    it('renders the Add Guidance button', () => {
        render(<TrainSection stepMetadata={mockStepMetadata} />)

        expect(screen.getByText('Add Guidance')).toBeInTheDocument()
    })
})
