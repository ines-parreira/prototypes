import React, {ReactNode, useCallback} from 'react'

import classnames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import {FeatureFlagKey} from 'config/featureFlags'
import {PlaygroundEditor} from '../PlaygroundEditor/PlaygroundEditor'
import {
    PlaygroundChannels,
    PlaygroundFormValues,
} from '../PlaygroundChat/PlaygroundChat.types'
import {PlaygroundCustomerSelection} from '../PlaygroundCustomerSelection/PlaygroundCustomerSelection'
import {PlaygroundSegmentControl} from '../PlaygroundSegmentControl/PlaygroundSegmentControl'
import css from './PlaygroundInputSection.less'

type Props = {
    formValues: PlaygroundFormValues
    onFormValuesChange: <Key extends keyof PlaygroundFormValues>(
        key: Key,
        value: PlaygroundFormValues[Key]
    ) => void
    isDisabled?: boolean
    isInitialMessage: boolean
    disabledMessage?: ReactNode
    onSendMessage: () => void
    onNewConversation: () => void
    isMessageSending: boolean
    onChannelChange: (channel: PlaygroundChannels) => void
    channel: PlaygroundChannels
}
export const PlaygroundInputSection = ({
    formValues,
    onFormValuesChange,
    isDisabled,
    disabledMessage,
    isInitialMessage,
    onSendMessage,
    onNewConversation,
    isMessageSending,
    onChannelChange,
    channel,
}: Props) => {
    const isTestModeInChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChatTestMode]
    const handleMessageChange = (message: string) => {
        onFormValuesChange('message', message)
    }

    const handleSubjectChange = (subject: string) => {
        onFormValuesChange('subject', subject)
    }

    const handleCustomerEmailChange = useCallback(
        (customerEmail: string, customerName?: string | null) => {
            onFormValuesChange('customerEmail', customerEmail)
            if (customerName) {
                onFormValuesChange('customerName', customerName)
            }
        },
        [onFormValuesChange]
    )

    const customerEmail = formValues.customerEmail ?? ''

    return (
        <div className={css.container}>
            <div
                className={classnames(css.section, {
                    [css.disabled]: !isInitialMessage,
                })}
            >
                {isTestModeInChatEnabled ? (
                    <div className={css.topSection}>
                        <PlaygroundSegmentControl
                            selectedChannel={channel}
                            onChannelChange={onChannelChange}
                            isDisabled={!isInitialMessage}
                        />
                        {channel === 'email' && (
                            <PlaygroundCustomerSelection
                                customerEmail={customerEmail}
                                onCustomerEmailChange={
                                    handleCustomerEmailChange
                                }
                                isDisabled={!isInitialMessage}
                            />
                        )}
                    </div>
                ) : (
                    <PlaygroundCustomerSelection
                        customerEmail={customerEmail}
                        onCustomerEmailChange={handleCustomerEmailChange}
                        isDisabled={!isInitialMessage}
                    />
                )}
            </div>
            {channel === 'email' && (
                <div
                    className={classnames(css.section, {
                        [css.disabled]: !isInitialMessage,
                    })}
                >
                    <TextInput
                        className={css.subjectInput}
                        value={formValues.subject}
                        onChange={handleSubjectChange}
                        maxLength={135}
                        prefix={
                            <span className="body-semibold">Subject: </span>
                        }
                        isDisabled={!isInitialMessage}
                    />
                </div>
            )}
            <div className={classnames(css.section, css.editor)}>
                <PlaygroundEditor
                    value={formValues.message}
                    onMessageChange={handleMessageChange}
                    onSubjectChange={handleSubjectChange}
                    enablePredefinedMessages={!isMessageSending}
                />
            </div>
            <div className={classnames(css.section, css.footer)}>
                {isDisabled && disabledMessage && (
                    <Tooltip target="send-button">{disabledMessage}</Tooltip>
                )}
                <Button
                    id="send-button"
                    isDisabled={isDisabled}
                    onClick={onSendMessage}
                >
                    Send
                </Button>
                <Button intent="secondary" onClick={onNewConversation}>
                    New Conversation
                </Button>
            </div>
        </div>
    )
}
