import React, { useCallback, useEffect, useMemo } from 'react'

import classnames from 'classnames'
import { Link } from 'react-router-dom'

import {
    ChatIntegrationListSelection,
    InstallationStatusInjectedChatItem,
} from 'pages/aiAgent/components/ChatIntegrationListSelection/ChatIntegrationListSelection'
import {
    INITIAL_FORM_VALUES,
    StoreConfigFormSection,
} from 'pages/aiAgent/constants'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { FormValues, UpdateValue } from 'pages/aiAgent/types'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'

import css from './ChatSettingsFormComponent.less'

type ChatSettingsFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    monitoredChatIntegrations: number[] | null
    chatChannels: InstallationStatusInjectedChatItem[]
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
}: ChatSettingsFormComponentProps) => {
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

    const buildChatErrorMessage = (chatId: number) => {
        return (
            <>
                <span>{'One or more Chats are not installed. '}</span>
                <Link
                    to={`/app/settings/channels/gorgias_chat/${chatId}/installation`}
                >
                    <span>{'Install Chat'}</span>{' '}
                    <i className={'warningLinkIcon material-icons'}>
                        open_in_new
                    </i>
                </Link>
            </>
        )
    }

    const selectedChats = useMemo(() => {
        const monitoredChatIntegrationsSet = new Set(
            monitoredChatIntegrations ?? [],
        )
        return chatChannels.filter((chat) =>
            monitoredChatIntegrationsSet.has(chat.value.id),
        )
    }, [chatChannels, monitoredChatIntegrations])

    const chatIntegrationsValidationError = useMemo(() => {
        // The first error is displayed, so the errors should be pushed in order of priority
        if (!selectedChats?.length && isRequired) {
            return 'One or more Chats required.'
        }

        if (
            selectedChats?.length &&
            selectedChats.some((chat) => chat.value.isUninstalled ?? false)
        ) {
            return buildChatErrorMessage(
                selectedChats.find((chat) => chat.value.isUninstalled)!.value
                    .id,
            )
        }
        return null
    }, [selectedChats, isRequired])

    const hasError = useMemo(() => {
        return !!chatIntegrationsValidationError && isRequired
    }, [chatIntegrationsValidationError, isRequired])

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
                                hasError={hasError}
                                isDisabled={isDisabled}
                                withDisabledText={dropDownWithDisabledText}
                                disabledText={dropDownDisabledText}
                            />
                            <div
                                className={classnames(css.formInputFooterInfo, {
                                    [css.error]: hasError,
                                })}
                            >
                                {chatIntegrationsValidationError}
                            </div>
                        </div>
                    </SettingsCardContent>
                </SettingsCard>
            </section>
        </div>
    )
}
