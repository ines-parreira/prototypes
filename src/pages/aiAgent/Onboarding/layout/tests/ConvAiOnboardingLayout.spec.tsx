import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams } from 'react-router-dom'

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

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        step: 'channels',
        shopName: undefined,
    })),
}))
const useParamsMock = assumeMock(useParams)

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    getAiAgentNavigationRoutes: jest.fn((shopName, __) => ({
        main: `/app/ai-agent/shopify/${shopName}`,
    })),
    aiAgentRoutes: {
        overview: '/app/ai-agent/overview',
    },
}))

describe('ConvAiOnboardingLayout', () => {
    it('should redirect to overview page when clicking on Close when no shop name is provided', () => {
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

    it('should redirect to the paywall when clicking on Content Close with shop name', () => {
        useParamsMock.mockReturnValueOnce({ shopName: 'hellohello' })
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

        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/hellohello',
        )
    })

    it('should redirect to preview when clicking on Preview Close without shop name', () => {
        useParamsMock.mockReturnValueOnce({ shopName: undefined })
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
                shopName: undefined,
            },
        )
        expect(historyPushMock).toHaveBeenCalledWith('/app/ai-agent/overview')
    })

    it('should redirect to the paywall when clicking on Preview Close with shop name', () => {
        useParamsMock.mockReturnValueOnce({ shopName: 'hellohello' })
        renderWithRouter(
            <OnboardingPreviewContainer isLoading={false} icon="info">
                Content
            </OnboardingPreviewContainer>,
        )

        const closeButton = screen.getByText(/close/)
        userEvent.click(closeButton)

        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/hellohello',
        )
    })

    it('should redirect to the overview when clicking on Preview Close without shop name', () => {
        useParamsMock.mockReturnValueOnce({ shopName: undefined })
        renderWithRouter(
            <OnboardingPreviewContainer isLoading={false} icon="info">
                Content
            </OnboardingPreviewContainer>,
        )

        const closeButton = screen.getByText(/close/)
        userEvent.click(closeButton)

        expect(historyPushMock).toHaveBeenCalledWith('/app/ai-agent/overview')
    })
})
