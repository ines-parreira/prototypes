import React, { useCallback, useMemo, useState } from 'react'

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

export const HandoverCustomizationSettingsFormComponent = ({
    shopName,
    shopType,
    monitoredChatIntegrationIds,
}: Props) => {
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const [selectedChat, setSelectedChat] =
        useState<SelfServiceChatChannel | null>(
            chatChannels.find(
                (chat) => chat.value.id === monitoredChatIntegrationIds?.[0],
            ) || null,
        )

    const availableChats = useMemo(() => {
        return chatChannels.filter((chat) =>
            monitoredChatIntegrationIds?.includes(chat.value.id),
        )
    }, [chatChannels, monitoredChatIntegrationIds])

    const onSelectedChatChange = useCallback(
        (value: Value) => {
            const chat = availableChats.find((chat) => chat.value.id === value)
            if (chat) {
                setSelectedChat(chat)
            }
        },
        [availableChats],
    )

    if (availableChats?.length === 0) {
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
                        fixedWidth={true}
                        value={selectedChat?.value.id}
                        onChange={onSelectedChatChange}
                    />
                )}
            </div>
            <Accordion>
                <AccordionItem>
                    <AccordionHeader>
                        <span className="body-semibold">
                            When offline or outside business hours
                        </span>
                    </AccordionHeader>
                    <AccordionBody>
                        <HandoverCustomizationOfflineSettings />
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem>
                    <AccordionHeader>
                        <div
                            className={cn(
                                css['accordion-header'],
                                'd-flex align-items-center',
                            )}
                        >
                            <span className="body-semibold">When online</span>
                            <IconTooltip className={css.icon}>
                                If agents are not available when Chat is online,
                                offline Chat settings will be used and business
                                hours won’t be shared
                            </IconTooltip>
                        </div>
                    </AccordionHeader>
                    <AccordionBody>
                        <HandoverCustomizationOnlineSettings />
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem>
                    <AccordionHeader>
                        <span className="body-semibold">
                            When an error occurs
                        </span>
                    </AccordionHeader>
                    <AccordionBody>
                        <HandoverCustomizationFallbackSettings />
                    </AccordionBody>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
