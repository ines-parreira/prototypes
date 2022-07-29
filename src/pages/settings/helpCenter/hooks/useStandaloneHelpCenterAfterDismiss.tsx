import {useMemo} from 'react'
import moment from 'moment'

import {HelpCenter} from 'models/helpCenter/types'

import {
    PRODUCT_BANNER_KEY,
    useProductBannerStorage,
} from 'hooks/useProductBannerStorage'

export function useStandaloneHelpCenterAfterDismiss(
    helpCenters: HelpCenter[],
    bannerKey: PRODUCT_BANNER_KEY
) {
    const standaloneHCs = useMemo(() => {
        return helpCenters.filter(
            (helpCenter) => helpCenter.source === 'automation'
        )
    }, [helpCenters])
    const {getProductBanner} = useProductBannerStorage()
    const productBannerInfo = getProductBanner(bannerKey)

    const helpCentersAfterDismiss = useMemo(() => {
        if (productBannerInfo) {
            const helpCenterList = standaloneHCs.filter((helpCenter) => {
                const creationDate = moment(helpCenter.created_datetime)

                // If the banner was previously closed but there are new standalone help centers
                if (productBannerInfo.closedAt) {
                    const closedDate = moment(productBannerInfo.closedAt)
                    return creationDate.isAfter(closedDate)
                }
            })

            return helpCenterList
        }

        return standaloneHCs
    }, [standaloneHCs, productBannerInfo])

    return helpCentersAfterDismiss
}
