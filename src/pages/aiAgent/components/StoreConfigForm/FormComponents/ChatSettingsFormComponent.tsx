import React, { useCallback, useEffect, useMemo } from 'react'

import classnames from 'classnames'

import { Label } from '@gorgias/merchant-ui-kit'

import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { INITIAL_FORM_VALUES, StoreConfigFormSection } from '../../../constants'
import { FormValues, UpdateValue } from '../../../types'
import { ChatIntegrationListSelection } from '../../ChatIntegrationListSelection/ChatIntegrationListSelection'

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
                <Label
                    className={css.label}
                    id="monitored-chat-channels"
                    isRequired={isRequired}
                >
                    Select one or more Chats
                </Label>
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
            </section>
            <section>
                <div>
                    See how{' '}
                    <a
                        href="https://link.gorgias.com/57d391"
                        target="_blank"
                        rel="noreferrer"
                    >
                        AI Agent hands over
                    </a>{' '}
                    tickets when your team is online or offline.
                </div>
            </section>
        </div>
    )
}
