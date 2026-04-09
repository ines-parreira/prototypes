import { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { Box, Skeleton, Text } from '@gorgias/axiom'

import type { LANGUAGE } from 'constants/languages'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { ChatChannelSelector } from 'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import useTrackOrderFlow from '../../legacy/trackOrder/hooks/useTrackOrderFlow'
import { OrderManagementFlowHeader } from '../components/OrderManagementFlowHeader/OrderManagementFlowHeader'

import css from './TrackOrderFlowView.less'

type FormValues = {
    unfulfilledMessage: string
}

export const TrackOrderFlowView = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const {
        trackOrderFlow,
        isUpdatePending,
        selfServiceConfiguration,
        handleTrackOrderFlowUpdate,
    } = useTrackOrderFlow(shopName)

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const [selectedChannelId, setSelectedChannelId] = useState<
        number | undefined
    >(() => chatChannels[0]?.value.id)

    const selectedChannel =
        chatChannels.find((c) => c.value.id === selectedChannelId) ??
        chatChannels[0]

    const appId = selectedChannel?.value.meta.app_id ?? null

    const selectedChannelLanguage = useMemo(() => {
        const primaryLanguage: LANGUAGE | undefined =
            selectedChannel?.value?.meta?.languages?.find((lang) => {
                return lang.primary === true
            })?.language

        return primaryLanguage
    }, [selectedChannel])

    const PreviewPanelHeaderActions = useMemo(() => {
        return chatChannels.length > 0 ? (
            <ChatChannelSelector
                chatChannels={chatChannels}
                selectedChannelId={selectedChannelId}
                onSelect={setSelectedChannelId}
            />
        ) : undefined
    }, [selectedChannelId, chatChannels])

    const { showPreviewPanel, chatPreviewPortal } = useChatPreviewPanel(
        PreviewPanelHeaderActions,
        selectedChannelLanguage,
    )

    useEffect(() => {
        showPreviewPanel(appId)
    }, [showPreviewPanel, appId])

    const { register, handleSubmit, formState } = useForm<FormValues>({
        values: {
            unfulfilledMessage: trackOrderFlow?.unfulfilledMessage?.text ?? '',
        },
    })

    const onSave = handleSubmit(async ({ unfulfilledMessage }) => {
        if (!trackOrderFlow) return
        await handleTrackOrderFlowUpdate({
            ...trackOrderFlow,
            unfulfilledMessage: {
                text: unfulfilledMessage,
                html: unfulfilledMessage,
            },
        })
    })

    const isLoading = !selfServiceConfiguration

    return (
        <>
            <OrderManagementFlowHeader
                title="Track order"
                onSave={onSave}
                isSaveDisabled={!formState.isDirty || isUpdatePending}
            />
            <Box flexDirection="column" gap="sm" p="lg">
                {isLoading ? (
                    <Skeleton height={120} />
                ) : (
                    <>
                        <Text size="md">Response for unfulfilled orders</Text>
                        <textarea
                            className={css.textarea}
                            {...register('unfulfilledMessage')}
                        />
                        <Text size="sm" color="content-neutral-secondary">
                            Display a custom message when customers track orders
                            that have not been packed and shipped. This is
                            useful for reminding customers of expected shipping
                            timelines or to inform them about possible delays.
                        </Text>
                    </>
                )}
            </Box>
            {chatPreviewPortal}
        </>
    )
}
