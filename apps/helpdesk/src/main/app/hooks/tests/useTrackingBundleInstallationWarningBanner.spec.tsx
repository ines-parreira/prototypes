import { AlertBannerTypes, BannerCategories, ContextBanner } from 'AlertBanners'
import { useWarningBannerIsDisplayed } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useWarningBannerIsDisplayed'
import { renderHook } from 'utils/testing/renderHook'

import { useTrackingBundleInstallationWarningBanner } from '../useTrackingBundleInstallationWarningBanner'

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/hooks/useWarningBannerIsDisplayed',
)
const mockUseWarningBannerIsDisplayed = jest.mocked(useWarningBannerIsDisplayed)

const mockedAddBanner = jest.fn<unknown, [ContextBanner]>()
const mockedRemoveBanner = jest.fn()

jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => ({
                addBanner: mockedAddBanner,
                removeBanner: mockedRemoveBanner,
            }),
        }) as Record<string, unknown>,
)

describe('useTrackingBundleInstallationWarningBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render banner if banner is displayed', () => {
        mockUseWarningBannerIsDisplayed.mockReturnValue({
            isBannerDisplayed: true,
            redirectToChatSettings: jest.fn(),
        } as any)

        renderHook(useTrackingBundleInstallationWarningBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith({
            preventDismiss: false,
            category: BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
            instanceId: BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
            type: AlertBannerTypes.Warning,
            message: `Please update your chat's manual installation script to enable tracking for your Shopping Assistant.`,
            CTA: {
                type: 'action',
                text: 'Update Installation',
                onClick: expect.any(Function),
            },
        })
    })

    it('should remove the banner if banner is no longer displayed', () => {
        mockUseWarningBannerIsDisplayed.mockReturnValue({
            isBannerDisplayed: true,
        } as any)

        const { rerender } = renderHook(
            useTrackingBundleInstallationWarningBanner,
        )

        expect(mockedAddBanner).toHaveBeenCalled()

        mockUseWarningBannerIsDisplayed.mockReturnValue({
            isBannerDisplayed: false,
        } as any)

        rerender()

        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
            BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
        )
    })
})
