import { act, renderHook } from '@testing-library/react-hooks'

import { PAGE_NAME } from '../constant'
import { useIngestionDomainBannerDismissed } from '../hooks/useIngestionDomainBannerDismissed'

describe('useIngestionDomainBannerDismissed', () => {
    const shopName = 'test-shop'

    beforeEach(() => {
        localStorage.clear()
    })

    it('returns false initially when no dismiss key is set', () => {
        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName }),
        )

        expect(result.current.isDismissed).toBe(false)
    })

    it('returns true if localStorage has the dismissed key for MANAGE', () => {
        localStorage.setItem(
            `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.MANAGE}`,
            'true',
        )

        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName }),
        )

        expect(result.current.isDismissed).toBe(true)
    })

    it('returns true if localStorage has the dismissed key for SOURCE', () => {
        localStorage.setItem(
            `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.SOURCE}`,
            'true',
        )

        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName, isSourcePage: true }),
        )

        expect(result.current.isDismissed).toBe(true)
    })

    it('dismissBanner sets the dismissed key in localStorage', () => {
        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName }),
        )

        act(() => {
            result.current.dismissBanner()
        })

        expect(
            localStorage.getItem(
                `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.MANAGE}`,
            ),
        ).toBe('true')

        expect(result.current.isDismissed).toBe(true)
    })

    it('resetAllBanner removes both dismiss keys', () => {
        localStorage.setItem(
            `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.MANAGE}`,
            'true',
        )
        localStorage.setItem(
            `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.SOURCE}`,
            'true',
        )

        const { result } = renderHook(() =>
            useIngestionDomainBannerDismissed({ shopName }),
        )

        act(() => {
            result.current.resetAllBanner()
        })

        expect(
            localStorage.getItem(
                `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.MANAGE}`,
            ),
        ).toBe(null)
        expect(
            localStorage.getItem(
                `scraped-domain-banner-dismissed-${shopName}-${PAGE_NAME.SOURCE}`,
            ),
        ).toBe(null)
    })
})
