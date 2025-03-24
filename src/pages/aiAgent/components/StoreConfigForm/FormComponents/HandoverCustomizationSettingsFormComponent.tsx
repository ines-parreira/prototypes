import { useCallback, useMemo, useState } from 'react'

import cn from 'classnames'

import useSelfServiceChatChannels, {
    SelfServiceChatChannel,
} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'

import HandoverCustomizationFallbackSettings from '../HandoverCustomizationSettingsComponents/HandoverCustomizationFallbackSettings'
import HandoverCustomizationOfflineSettings from '../HandoverCustomizationSettingsComponents/HandoverCustomizationOfflineSettings'
import HandoverCustomizationOnlineSettings from '../HandoverCustomizationSettingsComponents/HandoverCustomizationOnlineSettings'

import css from './HandoverCustomizationSettingsFormComponent.less'

type Props = {
    shopName: string
    shopType: string
    monitoredChatIntegrationIds: number[] | null
}

const getSelectedChat = (
    chatChannels: SelfServiceChatChannel[],
    monitoredChatIntegrationIds: number[] | null,
) => {
    if (!monitoredChatIntegrationIds?.length) {
        return undefined
    }

    return chatChannels.find((chat) =>
        monitoredChatIntegrationIds.includes(chat.value.id),
    )
}
export const HandoverCustomizationSettingsFormComponent = ({
    shopName,
    shopType,
    monitoredChatIntegrationIds,
}: Props) => {
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const [selectedChatId, setSelectedChatId] = useState(
        getSelectedChat(chatChannels, monitoredChatIntegrationIds)?.value.id,
    )

    const availableChats = useMemo(() => {
        return chatChannels.filter((chat) =>
            monitoredChatIntegrationIds?.includes(chat.value.id),
        )
    }, [chatChannels, monitoredChatIntegrationIds])

    const selectedChat = useMemo(() => {
        return availableChats.find((chat) => chat.value.id === selectedChatId)
    }, [availableChats, selectedChatId])

    const onSelectedChatChange = useCallback(
        (value: Value) => {
            const chat = availableChats.find((chat) => chat.value.id === value)
            if (chat) {
                setSelectedChatId(chat.value.id)
            }
        },
        [availableChats],
    )

    if (availableChats?.length === 0 || !selectedChat) {
        return null
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="body-semibold">Handover instructions</div>
                {availableChats && availableChats.length > 1 && (
                    <SelectField
                        id="handover-customization-chat-selection"
                        options={availableChats.map((chat) => ({
                            label: chat.value.name,
                            text: chat.value.name,
                            value: chat.value.id,
                        }))}
                        icon="forum"
                        aria-label="Select chat"
                        fixedWidth
                        value={selectedChat?.value.id}
                        onChange={onSelectedChatChange}
                    />
                )}
            </div>
            <Accordion className={css.sectionsAccordion}>
                <AccordionItem>
                    <AccordionHeader>
                        <span className="body-semibold">
                            When offline or outside business hours
                        </span>
                    </AccordionHeader>
                    <AccordionBody>
                        <HandoverCustomizationOfflineSettings
                            integration={selectedChat.value}
                        />
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem>
                    <AccordionHeader>
                        <div className={'d-flex align-items-center'}>
                            <span className="body-semibold">When online</span>
                            <IconTooltip
                                className={cn(css.icon, css.tooltipIcon)}
                            >
                                If agents are not available when Chat is online,
                                offline Chat settings will be used and business
                                hours won’t be shared
                            </IconTooltip>
                        </div>
                    </AccordionHeader>
                    <AccordionBody>
                        <HandoverCustomizationOnlineSettings
                            integration={selectedChat.value}
                        />
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem>
                    <AccordionHeader>
                        <span className="body-semibold">
                            When an error occurs
                        </span>
                    </AccordionHeader>
                    <AccordionBody>
                        <HandoverCustomizationFallbackSettings
                            integration={selectedChat.value}
                        />
                    </AccordionBody>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
