import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    ConvAiOnboardingLayout,
    OnboardingContentContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
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

    it('should hide and reactivate all banners when deactivateBanners and reactivateBanners are called', () => {
        document.body.innerHTML = `
            <div class="ui-banner-banner" style="display: block;">Banner 1</div>
            <div class="ui-banner-banner" style="display: block;">Banner 2</div>
        `

        const { unmount } = render(
            <ConvAiOnboardingLayout>Content</ConvAiOnboardingLayout>,
        )

        let banners = document.querySelectorAll('[class*="ui-banner-banner"]')
        banners.forEach((banner) => {
            expect((banner as HTMLElement).style.display).toBe('none')
        })

        // Trigger unmount to reactivate banners
        unmount()

        waitFor(() => {
            banners = document.querySelectorAll('[class*="ui-banner-banner"]')
            banners.forEach((banner) => {
                expect((banner as HTMLElement).style.display).toBe('block')
            })
        })
    })
})
