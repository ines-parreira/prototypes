import {render, screen, fireEvent, act} from '@testing-library/react'

import React from 'react'

import {OnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'

import {AiAgentScopes} from 'pages/aiAgent/Onboarding/types'

import {PersonalityPreviewStep} from '../PersonalityPreviewStep'

const mockSetOnboardingData = jest.fn()

const renderComponent = (scope: AiAgentScopes[]) => {
    return render(
        <>
            <OnboardingContext.Provider
                value={
                    {
                        scope,
                        setOnboardingData: mockSetOnboardingData,
                    } as any
                }
            >
                <PersonalityPreviewStep
                    currentStep={1}
                    totalSteps={3}
                    onNextClick={jest.fn()}
                    onBackClick={jest.fn()}
                />
            </OnboardingContext.Provider>
        </>
    )
}

describe('<PersonalityPreviewStep />', () => {
    describe.each([
        ['sales', [AiAgentScopes.SALES]],
        ['support', [AiAgentScopes.SUPPORT]],
        ['mixed', [AiAgentScopes.SALES, AiAgentScopes.SUPPORT]],
    ])('with scope defined as %s', (__, scope) => {
        it('should render with the title', () => {
            renderComponent(scope)
            expect(
                screen.getByText('Now see how your AI Agent will respond to')
            ).toBeInTheDocument()
        })

        it('should select the first personality preview', () => {
            renderComponent(scope)
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
            renderComponent(scope)

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
    })
})
