import { useCallback } from 'react'

import useLocalStorage from 'hooks/useLocalStorage'

import { PAGE_NAME } from '../constant'

type Props = {
    shopName: string
    pageName?: string
}

const getDismissedKey = (shopName: string, page: string) =>
    `scraped-domain-banner-dismissed-${shopName}-${page}`

export const useIngestionDomainBannerDismissed = ({
    shopName,
    pageName = PAGE_NAME.SOURCE,
}: Props) => {
    const dismissedKey = getDismissedKey(shopName, pageName)
    const [isDismissed, setIsDismissed] = useLocalStorage(dismissedKey, false)

    const resetAllBanner = useCallback(() => {
        setIsDismissed(false)
        localStorage.removeItem(getDismissedKey(shopName, PAGE_NAME.SOURCE))
        localStorage.removeItem(
            getDismissedKey(shopName, PAGE_NAME.STORE_WEBSITE),
        )
        localStorage.removeItem(getDismissedKey(shopName, PAGE_NAME.URL))
    }, [shopName, setIsDismissed])

    return {
        isDismissed,
        dismissBanner: () => setIsDismissed(true),
        resetAllBanner,
    }
}
