import { useEffect, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'

import type { HelpCenter } from 'models/helpCenter/types'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

const useHelpCenterOfShop = (shopName?: string, shopType?: string) => {
    const { client } = useHelpCenterApi()

    const [helpCenters, setHelpCenters] = useState<HelpCenter[]>([])

    const [{ loading: isLoadingHelpCenters }, fetchHelpCenters] =
        useAsyncFn(async () => {
            if (client) {
                try {
                    const {
                        data: { data: fetchedHelpCenters },
                    } = await client.listHelpCenters({
                        shop_name: shopName,
                        per_page: HELP_CENTER_MAX_CREATION,
                        type: 'faq',
                    })

                    setHelpCenters(fetchedHelpCenters)
                    return
                } catch (err) {
                    console.error(err)
                }

                setHelpCenters([])
            }
        }, [shopName, shopType, client])

    useEffect(() => {
        void fetchHelpCenters()
    }, [shopName, shopType, client, fetchHelpCenters])

    return {
        helpCenters,
        isLoadingHelpCenters,
    }
}

export default useHelpCenterOfShop
