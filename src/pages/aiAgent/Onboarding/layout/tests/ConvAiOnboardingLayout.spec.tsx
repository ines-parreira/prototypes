import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as segment from 'common/segment'
import {
    ConvAiOnboardingLayout,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import history from 'pages/history'
import { assumeMock, renderWithRouter } from 'utils/testing'

jest.mock('pages/history')
jest.mock('common/segment')
const historyPushMock = assumeMock(history.push)
const logEventMock = assumeMock(segment.logEvent)

describe('ConvAiOnboardingLayout', () => {
    it('should redirect to overview page when clicking on Close', () => {
        renderWithRouter(
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

        const { unmount } = renderWithRouter(
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

describe('OnboardingPreviewContainer', () => {
    it('should call logEvent and redirect to overview on close', () => {
        renderWithRouter(
            <OnboardingPreviewContainer isLoading={true} icon="info">
                Some content
            </OnboardingPreviewContainer>,
            {
                path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
                route: `/app/ai-agent/shopify/1/onboarding/${WizardStepEnum.CHANNELS}`,
            },
        )

        const closeBtn = screen.getByText(/close/i)
        userEvent.click(closeBtn)

        expect(logEventMock).toHaveBeenCalledWith(
            segment.SegmentEvent.AiAgentNewOnboardingWizardButtonClicked,
            {
                step: WizardStepEnum.CHANNELS,
                type: 'close',
            },
        )
        expect(historyPushMock).toHaveBeenCalledWith('/app/ai-agent/overview')
    })
})
