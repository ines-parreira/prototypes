import { useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'

export type BannerElement = HTMLElement & { originalDisplay?: string }

export const useHideBanners = () => {
    const banners = useRef<BannerElement[]>([])

    const deactivateBanners = () => {
        const elements = document.querySelectorAll(
            '[class*="ui-banner-banner"]',
        )
        elements.forEach((element) => {
            const bannerElement = element as BannerElement
            if (bannerElement.style.display !== 'none') {
                bannerElement.originalDisplay = bannerElement.style.display
                banners.current.push(bannerElement)
                bannerElement.style.display = 'none'
            }
        })
    }

    const reactivateBanners = () => {
        banners.current.forEach((element) => {
            element.style.display =
                (element as BannerElement).originalDisplay || ''
        })
    }

    useEffectOnce(() => {
        deactivateBanners()
        const observer = new MutationObserver(() => {
            deactivateBanners()
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })

        return () => {
            observer.disconnect()
            reactivateBanners()
        }
    })
}
