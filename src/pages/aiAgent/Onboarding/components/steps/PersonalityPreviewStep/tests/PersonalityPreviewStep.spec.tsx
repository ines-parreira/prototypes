import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {render, fireEvent, act, waitFor} from '@testing-library/react'

import React from 'react'

import {shopifyIntegration} from 'fixtures/integrations'
import {PersonalityPreviewStep} from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep'
import {DiscountStrategy} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {PersuasionLevel} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData', () => ({
    useGetOnboardingData: jest.fn(),
}))

const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

const queryClient = new QueryClient()

const setCurrentStep = jest.fn()

const renderComponent = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <PersonalityPreviewStep
                currentStep={2}
                totalSteps={3}
                setCurrentStep={setCurrentStep}
            />
        </QueryClientProvider>
    )
}

describe('<PersonalityPreviewStep />', () => {
    describe.each([
        ['sales', [AiAgentScopes.SALES]],
        ['support', [AiAgentScopes.SUPPORT]],
        ['mixed', [AiAgentScopes.SALES, AiAgentScopes.SUPPORT]],
    ])('with scope defined as %s', (scopeName, scope) => {
        beforeEach(() => {
            // Populate the return values of the mocked hooks
            mockUseGetOnboardingData.mockReturnValue({
                data: {
                    persuasionLevel: PersuasionLevel.Moderate,
                    discountStrategy: DiscountStrategy.Balanced,
                    maxDiscountPercentage: 8,
                    scope,
                    shop: shopifyIntegration.meta.shop_name,
                },
            })
        })

        it('should render with the title', () => {
            const screen = renderComponent()

            expect(
                screen.getByText('Now see how your AI Agent will respond to')
            ).toBeInTheDocument()
        })

        it('should select the first personality preview', () => {
            const screen = renderComponent()

            expect(screen.getAllByRole('radio')[0]).not.toHaveAttribute(
                'aria-busy'
            )

            expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
                'aria-checked',
                'true'
            )
            expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
                'aria-checked',
                'false'
            )
        })

        it('should allow selecting any preview item', () => {
            const screen = renderComponent()

            expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
                'aria-checked',
                'true'
            )
            expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
                'aria-checked',
                'false'
            )

            act(() => {
                fireEvent.click(screen.getAllByRole('radio')[1])
            })

            expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
                'aria-checked',
                'false'
            )
            expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
                'aria-checked',
                'true'
            )
        })

        it('navigates to the previous step when Back is clicked', async () => {
            const screen = renderComponent()

            const backButtons = screen.getAllByText(/Back/i)

            fireEvent.click(backButtons[1] || backButtons[0])

            await waitFor(
                () => {
                    expect(setCurrentStep).toHaveBeenCalledWith(
                        WizardStepEnum.CHANNELS
                    )
                },
                {timeout: 2000}
            )
        })

        it('navigates to the next step when Next is clicked', async () => {
            const screen = renderComponent()

            fireEvent.click(screen.getByText(/Next/i))

            const expectedCalledWith =
                scopeName === 'support'
                    ? WizardStepEnum.HANDOVER
                    : WizardStepEnum.SALES_PERSONALITY

            await waitFor(
                () => {
                    expect(setCurrentStep).toHaveBeenCalledWith(
                        expectedCalledWith
                    )
                },
                {timeout: 2000}
            )
        })
    })
})
