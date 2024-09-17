import {Label} from '@gorgias/ui-kit'
import React, {useEffect, useMemo} from 'react'
import classnames from 'classnames'
import {ChatIntegrationListSelection} from '../../ChatIntegrationListSelection/ChatIntegrationListSelection'
import {INITIAL_FORM_VALUES} from '../../../constants'
import {FormValues, UpdateValue} from '../../../types'
import {SelfServiceChatChannel} from '../../../../common/hooks/useSelfServiceChatChannels'
import css from './ChatSettingsFormComponent.less'

type EmailFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    monitoredChatIntegrations: number[] | null
    chatChannels: SelfServiceChatChannel[]
    initialValue?: number
    isFieldDirty?: boolean
    isDisabled?: boolean
}

export const ChatSettingsFormComponent = ({
    monitoredChatIntegrations,
    updateValue,
    chatChannels,
    initialValue,
    isDisabled,
}: EmailFormComponentProps) => {
    const useInitialValue = React.useRef(true)

    useEffect(() => {
        if (
            useInitialValue.current &&
            initialValue &&
            monitoredChatIntegrations?.length === 0
        ) {
            updateValue('monitoredChatIntegrations', [initialValue])
            useInitialValue.current = false
        }
    }, [initialValue, monitoredChatIntegrations, updateValue])

    const handleSelectChatIntegration = (values: number[]) => {
        const ids = values.map((option) => option)

        updateValue('monitoredChatIntegrations', ids)
    }

    const isChatIntegrationsValid = useMemo(() => {
        const isChatSelected = !!monitoredChatIntegrations?.length
        return isChatSelected || !isDisabled
    }, [monitoredChatIntegrations?.length, isDisabled])

    return (
        <div className={css.formGroup}>
            <Label className={css.label} isRequired={isDisabled}>
                AI Agent responds to tickets sent to the following Chats
            </Label>
            <ChatIntegrationListSelection
                selectedIds={
                    monitoredChatIntegrations !== null
                        ? monitoredChatIntegrations.map(
                              (integration) => integration
                          )
                        : INITIAL_FORM_VALUES.monitoredChatIntegrations
                }
                onSelectionChange={handleSelectChatIntegration}
                chatItems={chatChannels}
            />
            <div
                className={classnames(css.formInputFooterInfo, {
                    [css.error]: !isChatIntegrationsValid,
                })}
            >
                {!isChatIntegrationsValid
                    ? 'One or more chats required.'
                    : 'Select one or more Chats for AI Agent to use.'}
            </div>
        </div>
    )
}
