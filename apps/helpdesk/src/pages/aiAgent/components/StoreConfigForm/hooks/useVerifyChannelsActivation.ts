import { useCallback, useEffect } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import type { StoreConfiguration } from 'models/aiAgent/types'
import type { FormValues, UpdateValue } from 'pages/aiAgent/types'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useVerifyChannelsActivation = ({
    chatChannels,
    emailItems,
    storeConfiguration,
    updateStoreConfiguration,
    updateValue,
}: {
    chatChannels: SelfServiceChatChannel[]
    emailItems: { id: number; email: string }[]
    storeConfiguration?: StoreConfiguration
    updateStoreConfiguration: (
        storeConfiguration: StoreConfiguration,
    ) => Promise<void>
    updateValue: UpdateValue<FormValues>
}) => {
    const isCreate = storeConfiguration === undefined

    const dispatch = useAppDispatch()

    const deactivateAiAgentChannels = useCallback(
        async (channels: ('chat' | 'email')[]) => {
            if (isCreate) return

            if (!channels.length) return

            const deactivatedDatetime = new Date().toISOString()
            let updatedStoreConfiguration = {
                ...storeConfiguration,
            }

            if (channels.includes('chat')) {
                updateValue(
                    'chatChannelDeactivatedDatetime',
                    deactivatedDatetime,
                )
                updateValue('monitoredChatIntegrations', [])

                updatedStoreConfiguration.chatChannelDeactivatedDatetime =
                    deactivatedDatetime
                updatedStoreConfiguration.monitoredChatIntegrations = []
            }

            if (channels.includes('email')) {
                updateValue(
                    'emailChannelDeactivatedDatetime',
                    deactivatedDatetime,
                )
                updateValue('monitoredEmailIntegrations', [])

                updatedStoreConfiguration.emailChannelDeactivatedDatetime =
                    deactivatedDatetime
                updatedStoreConfiguration.monitoredEmailIntegrations = []
            }

            const formattedChannels = channels.join(' and ')

            try {
                await updateStoreConfiguration(updatedStoreConfiguration)

                void dispatch(
                    notify({
                        message: `AI Agent for ${formattedChannels} has been disabled, because no integration was available.`,
                        status: NotificationStatus.Warning,
                    }),
                )
            } catch (error) {
                // nothing to notify here for the user as we do silent disable AI Agent
                reportError(error, {
                    tags: { team: SentryTeam.AI_AGENT },
                    extra: {
                        context: `Error during disabling AI Agent for ${formattedChannels}`,
                    },
                })
            }
        },
        [
            isCreate,
            updateValue,
            updateStoreConfiguration,
            storeConfiguration,
            dispatch,
        ],
    )

    useEffect(() => {
        let channelsToDeactivate: ('email' | 'chat')[] = []
        const emailIds =
            storeConfiguration?.monitoredEmailIntegrations?.map(
                ({ id }) => id,
            ) || []

        if (
            storeConfiguration?.emailChannelDeactivatedDatetime === null &&
            !emailItems.some(({ id }) => emailIds.includes(id))
        ) {
            channelsToDeactivate.push('email')
        }

        if (
            storeConfiguration?.chatChannelDeactivatedDatetime === null &&
            !chatChannels.some(({ value: { id } }) =>
                storeConfiguration?.monitoredChatIntegrations?.includes(id),
            )
        ) {
            channelsToDeactivate.push('chat')
        }

        void deactivateAiAgentChannels(channelsToDeactivate)
    }, [
        deactivateAiAgentChannels,
        storeConfiguration?.chatChannelDeactivatedDatetime,
        storeConfiguration?.emailChannelDeactivatedDatetime,
        storeConfiguration?.monitoredChatIntegrations,
        storeConfiguration?.monitoredEmailIntegrations,
        emailItems,
        chatChannels,
    ])
}
