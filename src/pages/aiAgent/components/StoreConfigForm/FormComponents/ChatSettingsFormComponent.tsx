import {Label} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React, {useEffect, useMemo} from 'react'

import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import {INITIAL_FORM_VALUES} from '../../../constants'
import {FormValues, UpdateValue} from '../../../types'
import {ChatIntegrationListSelection} from '../../ChatIntegrationListSelection/ChatIntegrationListSelection'
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

    const handleSelectChatIntegration = (values: number[]) => {
        const ids = values.map((option) => option)

        if (setIsPristine) setIsPristine(false)
        updateValue('monitoredChatIntegrations', ids)
    }

    const isChatIntegrationsValid = useMemo(() => {
        const isChatSelected = !!monitoredChatIntegrations?.length
        return isChatSelected || !isRequired
    }, [monitoredChatIntegrations?.length, isRequired])

    return (
        <div className={css.formGroup}>
            <Label
                className={css.label}
                id="monitored-chat-channels"
                isRequired={isRequired}
            >
                AI Agent responds to tickets sent to the following Chats
            </Label>
            <ChatIntegrationListSelection
                labelId="monitored-chat-channels"
                selectedIds={
                    monitoredChatIntegrations !== null
                        ? monitoredChatIntegrations.map(
                              (integration) => integration
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
                    : 'Select one or more Chats for AI Agent to use.'}
            </div>
        </div>
    )
}
