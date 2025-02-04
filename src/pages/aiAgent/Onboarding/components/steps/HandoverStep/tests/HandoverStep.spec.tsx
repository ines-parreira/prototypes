import '@testing-library/jest-dom/extend-expect'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'

import React from 'react'

import HandoverStep from 'pages/aiAgent/Onboarding/components/steps/HandoverStep/HandoverStep'
import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData', () => ({
    useGetOnboardingData: jest.fn(),
}))

const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

const mockSetCurrentStep = jest.fn()

const queryClient = new QueryClient()

const renderComponent = () => {
    render(
        <QueryClientProvider client={queryClient}>
            <HandoverStep
                currentStep={2}
                totalSteps={3}
                setCurrentStep={mockSetCurrentStep}
            />
        </QueryClientProvider>
    )
}

describe('HandoverStep', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseGetOnboardingData.mockReturnValue({
            data: {
                persuasionLevel: PersuasionLevel.Moderate,
                discountStrategy: DiscountStrategy.Balanced,
                maxDiscountPercentage: 8,
                scope: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                shop: '',
            },
        })
    })

    it('should render without crashing', async () => {
        renderComponent()

        await waitFor(
            () => {
                expect(screen.getByText('Handover step')).toBeInTheDocument()
            },
            {timeout: 5000}
        )
    })

    it('navigates to the Knowledge step when Next is clicked', async () => {
        renderComponent()

        await waitFor(
            () => {
                expect(screen.getByText('Handover step')).toBeInTheDocument()
            },
            {timeout: 5000}
        )

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(
            () => {
                expect(mockSetCurrentStep).toHaveBeenCalledWith(
                    WizardStepEnum.KNOWLEDGE
                )
            },
            {timeout: 5000}
        )
    })

    it('navigates back to SALES_PERSONALITY if agent includes SALES', async () => {
        renderComponent()

        await waitFor(
            () => {
                expect(screen.getByText('Handover step')).toBeInTheDocument()
            },
            {timeout: 5000}
        )

        fireEvent.click(screen.getByText(/Back/i))
        expect(mockSetCurrentStep).toHaveBeenCalledWith(
            WizardStepEnum.SALES_PERSONALITY
        )
    })

    it('navigates back to PERSONALITY_PREVIEW if agent does not include SALES', async () => {
        mockUseGetOnboardingData.mockReturnValue({
            data: {
                persuasionLevel: PersuasionLevel.Moderate,
                discountStrategy: DiscountStrategy.Balanced,
                maxDiscountPercentage: 8,
                scope: [AiAgentScopes.SUPPORT],
                shop: '',
            },
        })

        renderComponent()

        await waitFor(
            () => {
                expect(screen.getByText('Handover step')).toBeInTheDocument()
            },
            {timeout: 5000}
        )

        fireEvent.click(screen.getByText(/Back/i))
        expect(mockSetCurrentStep).toHaveBeenCalledWith(
            WizardStepEnum.PERSONALITY_PREVIEW
        )
    })
})
