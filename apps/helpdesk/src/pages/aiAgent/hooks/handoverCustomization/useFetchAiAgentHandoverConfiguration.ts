import { useMemo } from 'react'

import { useGetStoreHandoverConfigurations } from 'models/aiAgent/queries'
import type { HandoverConfigurationData } from 'models/aiAgent/types'

import type { AiAgentChannel } from '../../constants'

type ConfigurationsArgs = {
    accountDomain: string
    storeName: string
    channel?: AiAgentChannel
    enabled: boolean
}
export const useFetchAiAgentStoreHandoverConfigurations = ({
    accountDomain,
    storeName,
    channel,
    enabled,
}: ConfigurationsArgs) => {
    const { data, isLoading, refetch } = useGetStoreHandoverConfigurations(
        {
            accountDomain,
            storeName,
            channel,
        },
        { enabled },
    )

    return {
        data: data?.handoverConfigurations,
        isLoading,
        refetch,
    }
}

export const useFetchAiAgentStoreHandoverConfiguration = ({
    accountDomain,
    storeName,
    channel,
    integrationId,
    enabled,
}: {
    accountDomain: string
    storeName: string
    channel?: AiAgentChannel
    integrationId: number
    enabled: boolean
}) => {
    const { data, isLoading, refetch } =
        useFetchAiAgentStoreHandoverConfigurations({
            accountDomain,
            storeName,
            channel,
            enabled,
        })

    const configurationData = useMemo(() => {
        if (!data || !data.length) {
            return undefined
        }

        return data.find(
            (configuration: HandoverConfigurationData) =>
                configuration.integrationId === integrationId,
        )
    }, [data, integrationId])

    return {
        data: configurationData,
        isLoading,
        refetch,
    }
}

export type AiAgentStoreHandoverConfiguration = Exclude<
    ReturnType<typeof useFetchAiAgentStoreHandoverConfiguration>['data'],
    null | undefined
>
