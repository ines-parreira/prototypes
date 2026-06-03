import { useAppContext } from 'pages/AppContext'

export const usePageTopBanner = () => {
    const { pageTopBannerRef, warpToPageTopBanner } = useAppContext()
    return { pageTopBannerRef, warpToPageTopBanner }
}
