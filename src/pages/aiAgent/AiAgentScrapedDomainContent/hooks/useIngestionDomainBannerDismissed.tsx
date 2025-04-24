import { useCallback } from 'react'

import useLocalStorage from 'hooks/useLocalStorage'

import { PAGE_NAME } from '../constant'

type Props = {
    shopName: string
    isSourcePage?: boolean
}

const getDismissedKey = (shopName: string, page: string) =>
    `scraped-domain-banner-dismissed-${shopName}-${page}`

export const useIngestionDomainBannerDismissed = ({
    shopName,
    isSourcePage = false,
}: Props) => {
    const dismissedKey = getDismissedKey(
        shopName,
        isSourcePage ? PAGE_NAME.SOURCE : PAGE_NAME.MANAGE,
    )
    const [isDismissed, setIsDismissed] = useLocalStorage(dismissedKey, false)

    const resetAllBanner = useCallback(() => {
        localStorage.removeItem(getDismissedKey(shopName, PAGE_NAME.SOURCE))
        localStorage.removeItem(getDismissedKey(shopName, PAGE_NAME.MANAGE))
    }, [shopName])

    return {
        isDismissed,
        dismissBanner: () => setIsDismissed(true),
        resetAllBanner,
    }
}
