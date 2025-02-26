import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OnboardingContentContainer } from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import history from 'pages/history'
import { assumeMock } from 'utils/testing'

jest.mock('pages/history')
const historyPushMock = assumeMock(history.push)

describe('ConvAiOnboardingLayout', () => {
    it('should redirect to overview page when clicking on Close', () => {
        render(
            <OnboardingContentContainer
                totalSteps={7}
                currentStep={1}
                onNextClick={() => {}}
                onBackClick={() => {}}
            >
                Content
            </OnboardingContentContainer>,
        )

        const closeButton = screen.getByText(/close/)
        userEvent.click(closeButton)

        expect(historyPushMock).toHaveBeenCalledWith('/app/ai-agent/overview')
    })
})
