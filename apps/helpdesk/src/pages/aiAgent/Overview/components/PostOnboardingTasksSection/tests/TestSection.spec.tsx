import React from 'react'

import { render, screen } from '@testing-library/react'

import { TestSection } from '../TestSection'
import { PostOnboardingTask } from '../types'

describe('TestSection', () => {
    const mockTask: PostOnboardingTask = {
        stepName: 'TEST',
        stepTitle: 'Test AI Agent',
        stepDescription: 'This is a test description for testing',
        stepImage: 'test-image-url',
    }

    it('renders the component with correct description', () => {
        render(<TestSection task={mockTask} />)

        expect(screen.getByText(mockTask.stepDescription)).toBeInTheDocument()
    })

    it('renders the image with correct src and alt text', () => {
        render(<TestSection task={mockTask} />)

        const image = screen.getByAltText('AI Agent testing')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', mockTask.stepImage)
    })

    it('renders the Test button', () => {
        render(<TestSection task={mockTask} />)

        expect(screen.getByText('Test')).toBeInTheDocument()
    })
})
