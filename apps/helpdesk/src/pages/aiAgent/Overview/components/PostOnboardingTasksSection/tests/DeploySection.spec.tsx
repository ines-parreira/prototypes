import React from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'

import { DeploySection } from '../DeploySection'
import { PostOnboardingStepMetadata } from '../types'

jest.mock(
    'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/ChannelToggle',
    () => ({
        ChannelToggle: ({ label, checked, disabled }: any) => (
            <div data-testid={`channel-toggle-${label.toLowerCase()}`}>
                <span>{label}</span>
                <span>{checked ? 'checked' : 'unchecked'}</span>
                <span>{disabled ? 'disabled' : 'enabled'}</span>
            </div>
        ),
    }),
)

describe('DeploySection', () => {
    const mockStepMetadata: PostOnboardingStepMetadata = {
        stepName: StepName.DEPLOY,
        stepTitle: 'Deploy AI Agent',
        stepDescription: 'This is a test description for deployment',
    }

    it('renders the component with correct description', () => {
        render(
            <MemoryRouter>
                <DeploySection stepMetadata={mockStepMetadata} />
            </MemoryRouter>,
        )

        expect(
            screen.getByText(mockStepMetadata.stepDescription),
        ).toBeInTheDocument()
    })

    it('renders the Email channel toggle with correct props', () => {
        render(
            <MemoryRouter>
                <DeploySection stepMetadata={mockStepMetadata} />
            </MemoryRouter>,
        )

        const emailToggle = screen.getByTestId('channel-toggle-email')
        expect(emailToggle).toBeInTheDocument()
        expect(emailToggle).toHaveTextContent('Email')
    })

    it('renders the Chat channel toggle with correct props', () => {
        render(
            <MemoryRouter>
                <DeploySection stepMetadata={mockStepMetadata} />
            </MemoryRouter>,
        )

        const chatToggle = screen.getByTestId('channel-toggle-chat')
        expect(chatToggle).toBeInTheDocument()
        expect(chatToggle).toHaveTextContent('Chat')
    })
})
