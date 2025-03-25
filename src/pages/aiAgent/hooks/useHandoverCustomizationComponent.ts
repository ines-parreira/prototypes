import { useCallback, useEffect, useMemo, useState } from 'react'

import useUpdateEffect from 'hooks/useUpdateEffect'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { Value } from 'pages/common/forms/SelectField/types'

import {
    getAvailableChats,
    getFirstAvailableChat,
} from '../utils/handoverCustomizationSettingsFormComponent.utils'

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

    const [selectedChatId, setSelectedChatId] = useState(
        getFirstAvailableChat({ chatChannels, monitoredChatIntegrationIds })
            ?.value.id,
    )

    const [activeSettingsSection, setActiveSettingsSection] = useState<
        HandoverCustomizationFormType | undefined
    >(undefined)

    const availableChats = useMemo(
        () => getAvailableChats({ chatChannels, monitoredChatIntegrationIds }),
        [chatChannels, monitoredChatIntegrationIds],
    )

    const selectedChat = useMemo(() => {
        return chatChannels.find((chat) => chat.value.id === selectedChatId)
    }, [chatChannels, selectedChatId])

    // accordion settings logic
    const isHandoverSectionDisabled = useMemo(() => {
        return !selectedChatId
    }, [selectedChatId])

    const onActiveSettingsSectionChange = useCallback(
        (sectionId?: string) =>
            setActiveSettingsSection(
                sectionId as HandoverCustomizationFormType,
            ),
        [setActiveSettingsSection],
    )

    const onSelectedChatChange = useCallback(
        (chatId?: Value) => {
            setSelectedChatId(chatId ? (chatId as number) : undefined)
        },
        [setSelectedChatId],
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
            setActiveSettingsSection(undefined)
        }
    }, [selectedChatId])

    return {
        availableChats,
        selectedChat,
        activeSettingsSection,
        onActiveSettingsSectionChange,
        onSelectedChatChange,
        isHandoverSectionDisabled,
    }
}
