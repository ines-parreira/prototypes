import { act } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

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
})
