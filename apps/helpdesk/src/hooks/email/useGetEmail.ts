import { useMemo } from 'react'

import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { useListStoreMappings } from 'models/storeMapping/queries'
import {
    getIntegrations,
    getIntegrationsByTypes,
} from 'state/integrations/selectors'

const EMAIL_CHANNEL = 'email'
export const useGetEmail = () => {
    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
    )

    const emailIntegrationsWithoutName = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            id: integration.id,
            email_id: integration.id,
            channel: EMAIL_CHANNEL,
        }))
    }, [emailIntegrations])

    return {
        emailIntegrationsWithoutName,
    }
}

export const useGetEmailIntegrationsWithStoreName = ({
    integrations,
    shopName,
}: {
    integrations: {
        id: number | null
        email_id: number
        channel: string
    }[]
    shopName: string
}) => {
    const { data: storeMappings } = useListStoreMappings(
        integrations.map((integration) => integration.email_id as number),
        {
            enabled: integrations.length > 0,
            refetchOnWindowFocus: false,
        },
    )
    const installedIntegrations = useAppSelector(getIntegrations)

    const storeMappingsMap = useMemo(() => {
        const map: { [key: string]: number } = {}
        storeMappings?.forEach((mapping) => {
            map[String(mapping.integration_id)] = mapping.store_id
        })
        return map
    }, [storeMappings])

    const emailIntegrationsWithStoreName = useMemo(() => {
        return integrations.map((integration) => {
            const storeIntegration = installedIntegrations.find(
                (_integration) =>
                    _integration.id ===
                    storeMappingsMap[String(integration.email_id)],
            )

            return {
                id: integration.id,
                storeName: storeIntegration?.name,
                channel: integration.channel,
            }
        })
    }, [integrations, storeMappingsMap, installedIntegrations])

    const emailIntegrationsWithStoreNamePerStore = useMemo(() => {
        return (
            emailIntegrationsWithStoreName.filter((integration) => {
                return integration.storeName === shopName
            }) || []
        )
    }, [emailIntegrationsWithStoreName, shopName])

    return emailIntegrationsWithStoreNamePerStore
}
