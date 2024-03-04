import {useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {AxiosResponse} from 'axios'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import {
    ChannelConnection,
    ChannelConnectionChannel,
    ChannelConnectionCreatePayload,
    ChannelConnectionListOptions,
} from 'models/convert/channelConnection/types'
import {
    channelConnectionKeys,
    useCreateChannelConnection,
    useListChannelConnections,
} from 'models/convert/channelConnection/queries'
import {useGetOneClickInstallationStatus} from 'pages/convert/common/hooks/useGetOneClickInstallationStatus'

const READ_RETRIES = 3

export const useGetOrCreateChannelConnection = (
    integration: GorgiasChatIntegration,
    retries = READ_RETRIES
) => {
    const queryClient = useQueryClient()
    const [createTriggered, setCreateTriggered] = useState(false)

    const options: ChannelConnectionListOptions = useMemo(() => {
        const externalId = integration.meta?.app_id

        return externalId !== undefined
            ? {
                  externalId: externalId,
                  channel: ChannelConnectionChannel.Widget,
              }
            : {}
    }, [integration.meta])

    const shouldFetchList = useMemo(
        () => Object.keys(options).length > 0,
        [options]
    )

    const installationStatus = useGetOneClickInstallationStatus(integration)
    const channelConnectionData: ChannelConnectionCreatePayload =
        useMemo(() => {
            const data: ChannelConnectionCreatePayload = {
                external_id: integration.meta?.app_id,
                external_installation_status: installationStatus,
                channel: ChannelConnectionChannel.Widget,
            }

            const storeIntegrationId =
                integration.meta?.shop_type === IntegrationType.Shopify
                    ? integration.meta?.shop_integration_id
                    : null
            if (storeIntegrationId !== null) {
                data.store_integration_id = storeIntegrationId
            }

            return data
        }, [integration.meta, installationStatus])

    const handleSuccessCallback = (
        data: AxiosResponse<ChannelConnection[] | any, any> | null
    ) => {
        const statusCode = data?.status ?? 200

        if (statusCode === 200) {
            const channelConnections = (data?.data ?? []) as ChannelConnection[]
            if (channelConnections.length === 0 && !createTriggered) {
                mutateCreate([undefined, channelConnectionData])
                setCreateTriggered(true)
            }
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

    const result: ChannelConnection | null = useMemo(() => {
        if (createTriggered) {
            return createDataResponse as ChannelConnection | null
        }

        return !!listData?.data &&
            Array.isArray(listData?.data) &&
            listData?.data.length > 0
            ? listData?.data[0]
            : null
    }, [createTriggered, createDataResponse, listData])

    const isLoading = listLoading || (createLoading && createTriggered)
    const isError = listError || (createError && createTriggered)
    const error = listError ? listErrorDetail : createErrorDetail

    return {
        channelConnection: result,
        isLoading,
        isError,
        error,
    }
}
