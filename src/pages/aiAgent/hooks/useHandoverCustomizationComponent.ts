import { useCallback, useEffect, useMemo, useState } from 'react'

import { GORGIAS_CHAT_LIVE_CHAT_OFFLINE } from 'config/integrations/gorgias_chat'
import useUpdateEffect from 'hooks/useUpdateEffect'
import {
    getAvailableChats,
    getFirstAvailableChat,
} from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatSettingsComponent.utils'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { Value } from 'pages/common/forms/SelectField/types'

import { StoreConfigFormSection } from '../constants'
import { useAiAgentFormChangesContext } from '../providers/AiAgentFormChangesContext'

export enum HandoverCustomizationFormType {
    OFFLINE_SETTINGS = 'offlineSettings',
    ONLINE_SETTINGS = 'onlineSettings',
    FALLBACK_SETTINGS = 'fallbackSettings',
}

type Props = {
    shopName: string
    shopType: string
    monitoredChatIntegrationIds: number[] | null
}

export const useHandoverCustomizationComponent = ({
    shopName,
    shopType,
    monitoredChatIntegrationIds,
}: Props) => {
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const { onLeaveContext, dirtySections } = useAiAgentFormChangesContext()

    const [selectedChatId, setSelectedChatId] = useState(
        getFirstAvailableChat({ chatChannels, monitoredChatIntegrationIds })
            ?.value.id,
    )

    const [activeSettingsSection, setActiveSettingsSection] =
        useState<HandoverCustomizationFormType | null>(null)

    const availableChats = useMemo(
        () => getAvailableChats({ chatChannels, monitoredChatIntegrationIds }),
        [chatChannels, monitoredChatIntegrationIds],
    )

    const selectedChat = useMemo(() => {
        return chatChannels.find((chat) => chat.value.id === selectedChatId)
    }, [chatChannels, selectedChatId])

    const isSelectedChatAvailabilityOffline = useMemo(() => {
        return (
            selectedChat?.value?.meta?.preferences?.live_chat_availability ===
            GORGIAS_CHAT_LIVE_CHAT_OFFLINE
        )
    }, [selectedChat])

    // accordion settings logic
    const isHandoverSectionDisabled = useMemo(() => {
        return !selectedChatId
    }, [selectedChatId])

    const isHandoverSectionDirty = useMemo(() => {
        return dirtySections.some(
            (section) =>
                section ===
                    StoreConfigFormSection.handoverCustomizationOfflineSettings ||
                section ===
                    StoreConfigFormSection.handoverCustomizationOnlineSettings ||
                section ===
                    StoreConfigFormSection.handoverCustomizationFallbackSettings,
        )
    }, [dirtySections])

    const onActiveSettingsSectionChange = useCallback(
        (section: HandoverCustomizationFormType | null) =>
            setActiveSettingsSection(section),
        [setActiveSettingsSection],
    )

    const onSelectedChatChange = useCallback(
        (chatId?: Value) => {
            const updateSelectedChat = () => {
                const chatIdValue = chatId ? (chatId as number) : undefined
                setSelectedChatId(chatIdValue)
            }

            if (!isHandoverSectionDirty) {
                updateSelectedChat()
                return
            }

            onLeaveContext({
                onDiscard: () => {
                    updateSelectedChat()
                },
            })
        },
        [isHandoverSectionDirty, setSelectedChatId, onLeaveContext],
    )

    // this effect is used to handle the case where the the chat list is changed outside handover customization component scope
    useUpdateEffect(() => {
        if (!availableChats.length) {
            setSelectedChatId(undefined)
            return
        }

        // check if the selected chat is available in the list of available chats
        const isSelectedChatAvailable = availableChats.some(
            (chat) => chat.value.id === selectedChatId,
        )

        if (!isSelectedChatAvailable) {
            // if the selected chat is not available, set the first available chat
            setSelectedChatId(
                getFirstAvailableChat({
                    chatChannels,
                    monitoredChatIntegrationIds,
                })?.value.id,
            )
        }
    }, [
        availableChats,
        selectedChatId,
        chatChannels,
        monitoredChatIntegrationIds,
    ])

    // reset active settings section when the selected chat is changed to undefined
    useEffect(() => {
        if (!selectedChatId) {
            setActiveSettingsSection(null)
        }
    }, [selectedChatId])

    return {
        availableChats,
        selectedChat,
        activeSettingsSection,
        onActiveSettingsSectionChange,
        onSelectedChatChange,
        isHandoverSectionDisabled,
        isSelectedChatAvailabilityOffline,
    }
}
