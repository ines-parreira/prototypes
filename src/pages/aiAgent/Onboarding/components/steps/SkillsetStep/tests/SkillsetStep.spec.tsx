import {render, screen, fireEvent, act} from '@testing-library/react'

import React from 'react'

import {OnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'

import SkillsetStep from '../SkillsetStep'

const mockSetOnboardingData = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview',
    () => ({
        __esModule: true,
        default: ({children}: {children: React.ReactNode}) => (
            <div>{children}</div>
        ),
    })
)

jest.mock(
    'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation',
    () => ({
        __esModule: true,
        default: () => <div>AI Agent Preview</div>,
    })
)

const renderComponent = () => {
    return render(
        <>
            <OnboardingContext.Provider
                value={{setOnboardingData: mockSetOnboardingData} as any}
            >
                <SkillsetStep
                    currentStep={1}
                    totalSteps={3}
                    onNextClick={jest.fn()}
                    onBackClick={jest.fn()}
                />
            </OnboardingContext.Provider>
        </>
    )
}

describe('<SkillsetStep />', () => {
    it('renders', () => {
        renderComponent()
        expect(
            screen.getByText('Welcome to Conversational AI')
        ).toBeInTheDocument()
    })

    it('user can select a goal', () => {
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        // click next
        expect(mockSetOnboardingData).toHaveBeenCalledTimes(1)
    })
})
