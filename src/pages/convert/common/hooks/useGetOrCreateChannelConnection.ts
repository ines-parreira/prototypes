import {useQueryClient} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'

import {
    channelConnectionKeys,
    useCreateChannelConnection,
    useListChannelConnections,
} from 'models/convert/channelConnection/queries'
import {
    ChannelConnection,
    ChannelConnectionChannel,
    ChannelConnectionCreatePayload,
    ChannelConnectionListOptions,
} from 'models/convert/channelConnection/types'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import useGetChatInstallationStatus from 'pages/convert/common/hooks/useGetChatInstallationStatus'

const READ_RETRIES = 3

export const useGetOrCreateChannelConnection = (
    integration: GorgiasChatIntegration | undefined,
    retries = READ_RETRIES
) => {
    const queryClient = useQueryClient()

    const [result, setResult] = useState<ChannelConnection | null>(null)

    const options: ChannelConnectionListOptions = useMemo(() => {
        const externalId = integration?.meta?.app_id

        return externalId !== undefined
            ? {
                  externalId: externalId,
                  channel: ChannelConnectionChannel.Widget,
              }
            : {}
    }, [integration?.meta])

    const shouldFetchList = useMemo(
        () => Object.keys(options).length > 0,
        [options]
    )

    const {installed, method} = useGetChatInstallationStatus(integration)
    const channelConnectionData: ChannelConnectionCreatePayload =
        useMemo(() => {
            const data: ChannelConnectionCreatePayload = {
                external_id: integration?.meta?.app_id,
                external_installation_status:
                    installed && method ? 'installed' : null,
                channel: ChannelConnectionChannel.Widget,
            }

            const storeIntegrationId =
                integration?.meta?.shop_type === IntegrationType.Shopify
                    ? integration.meta?.shop_integration_id
                    : null
            if (storeIntegrationId !== null) {
                data.store_integration_id = storeIntegrationId
            }

            return data
        }, [integration?.meta, installed, method])

    const handleSuccessCallback = (data: ChannelConnection[]) => {
        if (data.length === 0 && !createError) {
            mutateCreate([undefined, channelConnectionData])
        }
    }

    const {
        data: listData,
        isLoading: listLoading,
        isError: listError,
        error: listErrorDetail,
    } = useListChannelConnections(options, {
        enabled: shouldFetchList,
        retry: retries,
        onSuccess: handleSuccessCallback,
    })

    const {
        mutate: mutateCreate,
        data: createDataResponse,
        isLoading: createLoading,
        isError: createError,
        error: createErrorDetail,
    } = useCreateChannelConnection({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: channelConnectionKeys.all(),
            })
        },
    })

    useEffect(() => {
        if (Array.isArray(listData) && listData.length > 0) {
            setResult(listData[0])
        } else if (createDataResponse?.status === 201) {
            setResult(createDataResponse?.data as ChannelConnection)
        }
    }, [createDataResponse, listData])

    const isLoading = listLoading || createLoading
    const isError = listError || createError
    const error = listError ? listErrorDetail : createErrorDetail

    return {
        channelConnection: result,
        isLoading,
        isError,
        error,
    }
}
