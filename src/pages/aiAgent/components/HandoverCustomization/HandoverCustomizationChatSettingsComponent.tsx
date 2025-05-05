import { useState } from 'react'

import cn from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    HandoverCustomizationFormType,
    useHandoverCustomizationChatSettings,
} from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatSettings'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import HandoverCustomizationChatFallbackSettings from './FormComponents/HandoverCustomizationChatFallbackSettings'
import HandoverCustomizationChatOfflineSettings from './FormComponents/HandoverCustomizationChatOfflineSettings'
import HandoverCustomizationChatOnlineSettings from './FormComponents/HandoverCustomizationChatOnlineSettings'
import HandoverCustomizationChatSettingsDrawer from './FormComponents/HandoverCustomizationChatSettingsDrawer'

import css from './HandoverCustomizationChatSettingsComponent.less'

type Props = {
    shopName: string
    shopType: string
    monitoredChatIntegrationIds: number[] | null
}

export const HandoverCustomizationChatSettingsComponent = ({
    shopName,
    shopType,
    monitoredChatIntegrationIds,
}: Props) => {
    const isSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AiAgentSettingsRevamp]

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [activeDrawerContent, setActiveDrawerContent] = useState<
        'offline' | 'online' | 'error'
    >('offline')

    const {
        activeSettingsSection,
        availableChats,
        selectedChat,
        onActiveSettingsSectionChange,
        onSelectedChatChange,
        isHandoverSectionDisabled,
    } = useHandoverCustomizationChatSettings({
        shopName,
        shopType,
        monitoredChatIntegrationIds,
    })

    return (
        <div>
            {!isSettingsRevampEnabled && (
                <>
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
                                value={selectedChat?.value?.id}
                                onChange={onSelectedChatChange}
                            />
                        )}
                    </div>
                    <div
                        id="handover-customization-accordion"
                        className={cn({
                            [css.accordionWrapperDisabled]:
                                isHandoverSectionDisabled,
                        })}
                    >
                        <Tooltip
                            target="handover-customization-accordion"
                            placement="top"
                            disabled={!isHandoverSectionDisabled}
                        >
                            {`One or more chats must be selected
                in order to view handover settings.`}
                        </Tooltip>

                        <Accordion
                            onChange={onActiveSettingsSectionChange}
                            expandedItem={activeSettingsSection}
                        >
                            <AccordionItem
                                id={
                                    HandoverCustomizationFormType.OFFLINE_SETTINGS
                                }
                                isDisabled={isHandoverSectionDisabled}
                            >
                                <AccordionHeader>
                                    <span className="body-semibold">
                                        When Chat is offline
                                    </span>
                                    <IconTooltip
                                        className={css.icon}
                                        tooltipProps={{
                                            disabled: isHandoverSectionDisabled,
                                        }}
                                    >
                                        When you have set your Chat to be always
                                        offline or when Chat is outside of
                                        business hours
                                    </IconTooltip>
                                </AccordionHeader>
                                <AccordionBody>
                                    {selectedChat && (
                                        <HandoverCustomizationChatOfflineSettings
                                            integration={selectedChat.value}
                                        />
                                    )}
                                </AccordionBody>
                            </AccordionItem>
                            <AccordionItem
                                id={
                                    HandoverCustomizationFormType.ONLINE_SETTINGS
                                }
                                isDisabled={isHandoverSectionDisabled}
                            >
                                <AccordionHeader>
                                    <div
                                        className={cn(
                                            css['accordion-header'],
                                            'd-flex align-items-center',
                                        )}
                                    >
                                        <span className="body-semibold">
                                            When Chat is online
                                        </span>
                                        <IconTooltip
                                            className={css.icon}
                                            tooltipProps={{
                                                disabled:
                                                    isHandoverSectionDisabled,
                                            }}
                                        >
                                            When you have set your Chat to be
                                            live during business hours or live
                                            when agents are available
                                        </IconTooltip>
                                    </div>
                                </AccordionHeader>
                                <AccordionBody>
                                    {selectedChat && (
                                        <HandoverCustomizationChatOnlineSettings
                                            integration={selectedChat.value}
                                        />
                                    )}
                                </AccordionBody>
                            </AccordionItem>
                            <AccordionItem
                                id={
                                    HandoverCustomizationFormType.FALLBACK_SETTINGS
                                }
                                isDisabled={isHandoverSectionDisabled}
                            >
                                <AccordionHeader>
                                    <span className="body-semibold">
                                        When an error occurs
                                    </span>
                                </AccordionHeader>
                                <AccordionBody>
                                    {selectedChat && (
                                        <HandoverCustomizationChatFallbackSettings
                                            integration={selectedChat.value}
                                        />
                                    )}
                                </AccordionBody>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </>
            )}

            {isSettingsRevampEnabled && (
                <>
                    <SettingsCard>
                        <SettingsCardHeader>
                            <SettingsCardTitle>
                                Handover instructions
                            </SettingsCardTitle>
                            AI Agent automatically hands over ticket to your
                            team whenever it lacks confidence in an answer,
                            encounters a listed handover topic, or does not find
                            any relevant knowledge to answer the shopper&apos;s
                            question. Further customize your Chat&apos;s
                            handover behavior below.
                        </SettingsCardHeader>
                        <SettingsCardContent id="handover-customization-container">
                            {availableChats && availableChats.length > 1 && (
                                <SelectField
                                    id="handover-customization"
                                    options={availableChats.map((chat) => ({
                                        label: chat.value.name,
                                        text: chat.value.name,
                                        value: chat.value.id,
                                    }))}
                                    icon="forum"
                                    aria-label="Select chat"
                                    fixedWidth
                                    value={selectedChat?.value?.id}
                                    onChange={onSelectedChatChange}
                                />
                            )}
                            <Tooltip
                                target="handover-customization-container"
                                placement="top"
                                disabled={!isHandoverSectionDisabled}
                            >
                                {`One or more chats must be selected
                    in order to view handover settings.`}
                            </Tooltip>

                            <SettingsFeatureRow
                                title="When Chat is offline"
                                isDisabled={isHandoverSectionDisabled}
                                onClick={() => {
                                    setActiveDrawerContent('offline')
                                    setIsDrawerOpen(true)
                                }}
                            />
                            <SettingsFeatureRow
                                title="When Chat is online"
                                isDisabled={isHandoverSectionDisabled}
                                onClick={() => {
                                    setActiveDrawerContent('online')
                                    setIsDrawerOpen(true)
                                }}
                            />
                            <SettingsFeatureRow
                                title="When an error occurs"
                                isDisabled={isHandoverSectionDisabled}
                                onClick={() => {
                                    setActiveDrawerContent('error')
                                    setIsDrawerOpen(true)
                                }}
                            />
                        </SettingsCardContent>
                    </SettingsCard>

                    {selectedChat?.value && (
                        <HandoverCustomizationChatSettingsDrawer
                            integration={selectedChat?.value}
                            open={isDrawerOpen}
                            onClose={() => setIsDrawerOpen(false)}
                            activeContent={activeDrawerContent}
                        />
                    )}
                </>
            )}
        </div>
    )
}
