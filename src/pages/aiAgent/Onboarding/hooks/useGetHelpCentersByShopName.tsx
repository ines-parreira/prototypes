import { HelpCenter } from 'models/helpCenter/types'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'

export const useGetHelpCentersByShopName = (
    shopName: string,
): {
    helpCenters: HelpCenter[]
    isHelpCenterLoading: boolean
} => {
    const { helpCenters, isLoading } = useHelpCenterList({
        per_page: HELP_CENTER_MAX_CREATION,
        type: 'faq',
        shop_name: shopName,
    })

    return { isHelpCenterLoading: isLoading, helpCenters }
}
