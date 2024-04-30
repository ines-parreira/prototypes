import {useState, useEffect} from 'react'

import useAsyncFn from 'hooks/useAsyncFn'
import {IntegrationType} from 'models/integration/constants'
import {HelpCenter} from 'models/helpCenter/types'

import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'

const useHelpCenterOfShop = (shopName?: string, shopType?: string) => {
    const {client} = useHelpCenterApi()

    const [helpCenters, setHelpCenters] = useState<HelpCenter[]>([])

    const [{loading: isLoadingHelpCenters}, fetchHelpCenters] =
        useAsyncFn(async () => {
            if (client && shopType === IntegrationType.Shopify) {
                try {
                    const {
                        data: {data: fetchedHelpCenters},
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
