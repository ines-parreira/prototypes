import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { PAGE_NAME } from '../constant'
import { useIngestionDomainBannerDismissed } from '../hooks/useIngestionDomainBannerDismissed'

describe('useIngestionDomainBannerDismissed', () => {
    const shopName = 'test-shop'
    const pageName = PAGE_NAME.STORE_WEBSITE

    beforeEach(() => {
        localStorage.clear()
    })

    it('returns false initially when no dismiss key is set', () => {
        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName, pageName }),
        )

        expect(result.current.isDismissed).toBe(false)
    })

    it('returns true if localStorage has the dismissed key for MANAGE', () => {
        localStorage.setItem(
            `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.STORE_WEBSITE}`,
            'true',
        )

        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName, pageName }),
        )

        expect(result.current.isDismissed).toBe(true)
    })

    it('returns true if localStorage has the dismissed key for SOURCE', () => {
        localStorage.setItem(
            `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.SOURCE}`,
            'true',
        )

        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({
                shopName,
                pageName: PAGE_NAME.SOURCE,
            }),
        )

        expect(result.current.isDismissed).toBe(true)
    })

    it('dismissBanner sets the dismissed key in localStorage', () => {
        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName, pageName }),
        )

        act(() => {
            result.current.dismissBanner()
        })

        expect(
            localStorage.getItem(
                `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.STORE_WEBSITE}`,
            ),
        ).toBe('true')

        expect(result.current.isDismissed).toBe(true)
    })

    it('resetAllBanner removes both dismiss keys', () => {
        localStorage.setItem(
            `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.STORE_WEBSITE}`,
            'true',
        )
        localStorage.setItem(
            `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.SOURCE}`,
            'true',
        )

        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName, pageName }),
        )

        act(() => {
            result.current.resetAllBanner()
        })

        expect(
            localStorage.getItem(
                `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.STORE_WEBSITE}`,
            ),
        ).toBe(null)
        expect(
            localStorage.getItem(
                `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.SOURCE}`,
            ),
        ).toBe(null)
    })

    it('resetBanner removes only the specific page dismiss key', () => {
        const dismissedKey = `scraped-domain-banner-dismissed-${shopName}-${pageName}`
        localStorage.setItem(dismissedKey, 'true')

        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName, pageName }),
        )

        expect(result.current.isDismissed).toBe(true)

        act(() => {
            result.current.resetBanner()
        })

        expect(localStorage.getItem(dismissedKey)).toBe(null)
        expect(result.current.isDismissed).toBe(false)
    })

    it('resetBanner only affects the current page, not other pages', () => {
        const storeWebsiteKey = `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.STORE_WEBSITE}`
        const sourceKey = `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.SOURCE}`

        localStorage.setItem(storeWebsiteKey, 'true')
        localStorage.setItem(sourceKey, 'true')

        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({
                shopName,
                pageName: PAGE_NAME.STORE_WEBSITE,
            }),
        )

        act(() => {
            result.current.resetBanner()
        })

        expect(localStorage.getItem(storeWebsiteKey)).toBe(null)
        expect(localStorage.getItem(sourceKey)).toBe('true')
    })
})
