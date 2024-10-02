import React, {ReactNode, useCallback, useEffect, useRef} from 'react'

import classnames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import {PlaygroundPromptType} from 'models/aiAgentPlayground/types'
import {useSearchParam} from 'hooks/useSearchParam'
import {PlaygroundEditor} from '../PlaygroundEditor/PlaygroundEditor'
import {
    PlaygroundChannels,
    PlaygroundFormValues,
} from '../PlaygroundChat/PlaygroundChat.types'
import {PlaygroundCustomerSelection} from '../PlaygroundCustomerSelection/PlaygroundCustomerSelection'
import {PlaygroundSegmentControl} from '../PlaygroundSegmentControl/PlaygroundSegmentControl'
import {PlaygroundAction} from '../PlaygroundActions/types'
import {
    PLAYGROUND_PROMPT_CONTENT,
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
} from '../../constants'
import {PlaygroundCustomer} from '../../types'
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
    isWaitingResponse: boolean
    onPromptMessage: (action: PlaygroundPromptType) => void
    isChatTestModeEnabled?: boolean
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
    isWaitingResponse,
    onPromptMessage,
    isChatTestModeEnabled,
}: Props) => {
    const handleMessageChange = (message: string) => {
        onFormValuesChange('message', message)
    }

    const [wizardQueryParam, setWizardQueryParam] = useSearchParam(
        WIZARD_POST_COMPLETION_QUERY_KEY
    )
    const subjectInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (
            wizardQueryParam === WIZARD_POST_COMPLETION_STATE.test_subject &&
            subjectInputRef.current
        ) {
            subjectInputRef.current.focus()
            setWizardQueryParam(null)
        }
    }, [setWizardQueryParam, wizardQueryParam])

    const handleSubjectChange = (subject: string) => {
        onFormValuesChange('subject', subject)
    }

    const customActions: PlaygroundAction[] | undefined = isWaitingResponse
        ? [
              {
                  id: 1,
                  label: PLAYGROUND_PROMPT_CONTENT[
                      PlaygroundPromptType.RELEVANT_RESPONSE
                  ],
                  onClick: () => {
                      onPromptMessage(PlaygroundPromptType.RELEVANT_RESPONSE)
                  },
              },
              {
                  id: 2,
                  label: PLAYGROUND_PROMPT_CONTENT[
                      PlaygroundPromptType.NOT_RELEVANT_RESPONSE
                  ],
                  onClick: () => {
                      onPromptMessage(
                          PlaygroundPromptType.NOT_RELEVANT_RESPONSE
                      )
                  },
              },
          ]
        : undefined

    const handleCustomerEmailChange = useCallback(
        (customer: PlaygroundCustomer) => {
            onFormValuesChange('customer', customer)
        },
        [onFormValuesChange]
    )

    return (
        <div className={css.container}>
            <div
                className={classnames(css.section, {
                    [css.disabled]: !isInitialMessage,
                })}
            >
                {isChatTestModeEnabled ? (
                    <div className={css.topSection}>
                        <PlaygroundSegmentControl
                            selectedChannel={channel}
                            onChannelChange={onChannelChange}
                            isDisabled={!isInitialMessage}
                        />
                        {channel === 'email' && (
                            <PlaygroundCustomerSelection
                                customer={formValues.customer}
                                onCustomerEmailChange={
                                    handleCustomerEmailChange
                                }
                                isDisabled={!isInitialMessage}
                            />
                        )}
                    </div>
                ) : (
                    <PlaygroundCustomerSelection
                        customer={formValues.customer}
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
                        ref={subjectInputRef}
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
                    customActions={customActions}
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
