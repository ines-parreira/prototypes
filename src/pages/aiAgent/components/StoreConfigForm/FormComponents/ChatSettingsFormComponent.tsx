import React, { useCallback, useEffect, useMemo } from 'react'

import classnames from 'classnames'

import { ChatIntegrationListSelection } from 'pages/aiAgent/components/ChatIntegrationListSelection/ChatIntegrationListSelection'
import {
    INITIAL_FORM_VALUES,
    StoreConfigFormSection,
} from 'pages/aiAgent/constants'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { FormValues, UpdateValue } from 'pages/aiAgent/types'
import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'

import css from './ChatSettingsFormComponent.less'

type EmailFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    monitoredChatIntegrations: number[] | null
    chatChannels: SelfServiceChatChannel[]
    initialValue?: number
    isFieldDirty?: boolean
    isRequired?: boolean
    isDisabled?: boolean
    shouldPrefillValue?: boolean
    setIsPristine?: (isPristine: boolean) => void
    dropDownWithDisabledText?: boolean
    dropDownDisabledText?: string
}

export const ChatSettingsFormComponent = ({
    monitoredChatIntegrations,
    updateValue,
    chatChannels,
    initialValue,
    isRequired,
    shouldPrefillValue,
    setIsPristine,
    isDisabled,
    dropDownWithDisabledText = false,
    dropDownDisabledText,
}: EmailFormComponentProps) => {
    const useInitialValue = React.useRef(true)

    const { onLeaveContext, dirtySections } = useAiAgentFormChangesContext()

    useEffect(() => {
        if (
            useInitialValue.current &&
            initialValue &&
            monitoredChatIntegrations?.length === 0 &&
            shouldPrefillValue
        ) {
            updateValue('monitoredChatIntegrations', [initialValue])
            useInitialValue.current = false
        }
    }, [
        initialValue,
        monitoredChatIntegrations,
        shouldPrefillValue,
        updateValue,
    ])

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

    const isChatIntegrationsValid = useMemo(() => {
        const isChatSelected = !!monitoredChatIntegrations?.length
        return isChatSelected || !isRequired
    }, [monitoredChatIntegrations?.length, isRequired])

    const handleSelectChatIntegration = useCallback(
        (values: number[]) => {
            const updateChatIntegrations = () => {
                const ids = values.map((option) => option)

                if (setIsPristine) setIsPristine(false)
                updateValue('monitoredChatIntegrations', ids)
            }

            if (!isHandoverSectionDirty) {
                updateChatIntegrations()
                return
            }

            onLeaveContext({
                onDiscard: () => {
                    updateChatIntegrations()
                },
            })
        },
        [updateValue, setIsPristine, isHandoverSectionDirty, onLeaveContext],
    )

    return (
        <div className={css.chatSettingsFormComponent}>
            <section>
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle
                            id="monitored-chat-channels"
                            isRequired={isRequired}
                        >
                            Select one or more Chats for AI Agent
                        </SettingsCardTitle>
                        You can connect AI Agent to your Chat so it can start
                        answering customer questions.
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <div>
                            <ChatIntegrationListSelection
                                labelId="monitored-chat-channels"
                                selectedIds={
                                    monitoredChatIntegrations !== null
                                        ? monitoredChatIntegrations.map(
                                              (integration) => integration,
                                          )
                                        : INITIAL_FORM_VALUES.monitoredChatIntegrations
                                }
                                onSelectionChange={handleSelectChatIntegration}
                                chatItems={chatChannels}
                                hasError={!isChatIntegrationsValid}
                                isDisabled={isDisabled}
                                withDisabledText={dropDownWithDisabledText}
                                disabledText={dropDownDisabledText}
                            />
                            <div
                                className={classnames(css.formInputFooterInfo, {
                                    [css.error]: !isChatIntegrationsValid,
                                })}
                            >
                                {!isChatIntegrationsValid
                                    ? 'One or more Chats required.'
                                    : null}
                            </div>
                        </div>
                    </SettingsCardContent>
                </SettingsCard>
            </section>
        </div>
    )
}
