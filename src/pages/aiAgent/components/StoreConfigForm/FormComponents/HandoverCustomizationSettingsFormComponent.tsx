import { useMemo } from 'react'

import cn from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import {
    HandoverCustomizationFormType,
    useHandoverCustomizationComponent,
} from 'pages/aiAgent/hooks/useHandoverCustomizationComponent'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import SelectField from 'pages/common/forms/SelectField/SelectField'

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
    const {
        activeSettingsSection,
        availableChats,
        selectedChat,
        onActiveSettingsSectionChange,
        onSelectedChatChange,
        isHandoverSectionDisabled,
        isSelectedChatAvailabilityOffline,
    } = useHandoverCustomizationComponent({
        shopName,
        shopType,
        monitoredChatIntegrationIds,
    })

    const chatSettingsHref = useMemo(() => {
        if (selectedChat) {
            return `/app/settings/channels/gorgias_chat/${selectedChat.value.id}/preferences`
        }
        return ''
    }, [selectedChat])

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div
                    className={cn(
                        'body-semibold',
                        css.handoverInstructionsTitle,
                    )}
                >
                    Handover instructions
                </div>
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
            <Accordion
                onChange={onActiveSettingsSectionChange}
                expandedItem={activeSettingsSection}
            >
                <AccordionItem
                    id={HandoverCustomizationFormType.OFFLINE_SETTINGS}
                    isDisabled={isHandoverSectionDisabled}
                >
                    <AccordionHeader>
                        <span className="body-semibold">
                            When offline or outside business hours
                        </span>
                    </AccordionHeader>
                    <AccordionBody>
                        {selectedChat && (
                            <HandoverCustomizationOfflineSettings
                                integration={selectedChat.value}
                            />
                        )}
                    </AccordionBody>
                </AccordionItem>

                <div
                    id={`${HandoverCustomizationFormType.ONLINE_SETTINGS}-wrapper`}
                >
                    <Tooltip
                        target={`${HandoverCustomizationFormType.ONLINE_SETTINGS}-wrapper`}
                        disabled={!isSelectedChatAvailabilityOffline}
                        autohide={false}
                    >
                        <a
                            href={chatSettingsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Set your Chat live
                        </a>
                        {` in order to configure online handover settings`}
                    </Tooltip>
                    <AccordionItem
                        id={HandoverCustomizationFormType.ONLINE_SETTINGS}
                        isDisabled={
                            isHandoverSectionDisabled ||
                            isSelectedChatAvailabilityOffline
                        }
                    >
                        <AccordionHeader>
                            <div
                                className={cn(
                                    css['accordion-header'],
                                    'd-flex align-items-center',
                                )}
                            >
                                <span className="body-semibold">
                                    When online
                                </span>
                                <IconTooltip className={css.icon}>
                                    If agents are not available when Chat is
                                    online, offline Chat settings will be used
                                    and business hours won’t be shared
                                </IconTooltip>
                            </div>
                        </AccordionHeader>
                        <AccordionBody>
                            {selectedChat && (
                                <HandoverCustomizationOnlineSettings
                                    integration={selectedChat.value}
                                />
                            )}
                        </AccordionBody>
                    </AccordionItem>
                </div>
                <AccordionItem
                    id={HandoverCustomizationFormType.FALLBACK_SETTINGS}
                    isDisabled={isHandoverSectionDisabled}
                >
                    <AccordionHeader>
                        <span className="body-semibold">
                            When an error occurs
                        </span>
                    </AccordionHeader>
                    <AccordionBody>
                        {selectedChat && (
                            <HandoverCustomizationFallbackSettings
                                integration={selectedChat.value}
                            />
                        )}
                    </AccordionBody>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
