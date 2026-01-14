import { waitFor } from '@testing-library/react'

import { ConvAiOnboardingLayout } from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import { renderWithRouter } from 'utils/testing'

describe('ConvAiOnboardingLayout', () => {
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
