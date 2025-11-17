import { useState } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatSettings } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatSettings'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import HandoverCustomizationChatSettingsDrawer from './FormComponents/HandoverCustomizationChatSettingsDrawer'

type Props = {
    shopName: string
    shopType: string
    monitoredChatIntegrationIds: number[] | null
    setIsFormDirty: (
        element: StoreConfigFormSection,
        isFormDirty: boolean,
    ) => void
}

export const HandoverCustomizationChatSettingsComponent = ({
    shopName,
    shopType,
    monitoredChatIntegrationIds,
    setIsFormDirty,
}: Props) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [activeDrawerContent, setActiveDrawerContent] = useState<
        'offline' | 'online' | 'error'
    >('offline')

    const {
        availableChats,
        selectedChat,
        onSelectedChatChange,
        isHandoverSectionDisabled,
    } = useHandoverCustomizationChatSettings({
        shopName,
        shopType,
        monitoredChatIntegrationIds,
    })

    return (
        <div>
            <>
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>
                            Handover instructions
                        </SettingsCardTitle>
                        <p>
                            AI Agent automatically hands over ticket to your
                            team whenever it lacks confidence in an answer,
                            encounters a listed handover topic, or does not find
                            any relevant knowledge to answer the shopper&apos;s
                            question. Further customize your{' '}
                            <a
                                href="https://link.gorgias.com/edcd10"
                                target="_blank"
                            >
                                Chat&apos;s handover behavior
                            </a>{' '}
                            below.
                        </p>
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
                        setIsFormDirty={setIsFormDirty}
                    />
                )}
            </>
        </div>
    )
}
