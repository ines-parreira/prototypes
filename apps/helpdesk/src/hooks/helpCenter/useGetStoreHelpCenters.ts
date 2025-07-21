import { useMemo } from 'react'

import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'

const HELP_CENTER_CHANNEL = 'help-center'
export const useGetHelpCentersIntegrationIdsForStore = ({
    shopName,
}: {
    shopName: string
}): {
    helpCentersIntegrationsWithName: {
        id: number
        channel: string
    }[]
    helpCentersIntegrationsWithoutName: {
        id: number | null
        email_id: number
        channel: string
    }[]
} => {
    const { data: helpCenterListData } = useGetHelpCenterList(
        { type: 'faq', per_page: HELP_CENTER_MAX_CREATION },
        {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    )

    const helpCentersIntegrationsWithName = useMemo(() => {
        const withName: {
            id: number
            channel: string
        }[] = []
        const withoutName: {
            id: number | null
            email_id: number
            channel: string
        }[] = []

        helpCenterListData?.data.data.forEach((hc) => {
            if (hc.shop_name === shopName) {
                if (hc.integration_id) {
                    withName.push({
                        id: hc.integration_id,
                        channel: HELP_CENTER_CHANNEL,
                    })
                }
            } else {
                if (hc?.email_integration?.id) {
                    withoutName.push({
                        id: hc.integration_id,
                        email_id: hc.email_integration.id,
                        channel: HELP_CENTER_CHANNEL,
                    })
                }
            }
        })

        return { withName, withoutName }
    }, [helpCenterListData, shopName])

    return {
        helpCentersIntegrationsWithName:
            helpCentersIntegrationsWithName.withName,
        helpCentersIntegrationsWithoutName:
            helpCentersIntegrationsWithName.withoutName,
    }
}
