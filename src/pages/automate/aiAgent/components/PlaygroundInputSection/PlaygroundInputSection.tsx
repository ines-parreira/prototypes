import React, {ReactNode} from 'react'

import classnames from 'classnames'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import Tooltip from 'pages/common/components/Tooltip'
import {PlaygroundEditor} from '../PlaygroundEditor/PlaygroundEditor'
import {PlaygroundFormValues} from '../PlaygroundChat/PlaygroundChat.types'
import {PlaygroundCustomerSelection} from '../PlaygroundCustomerSelection/PlaygroundCustomerSelection'
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
}
export const PlaygroundInputSection = ({
    formValues,
    onFormValuesChange,
    isDisabled,
    disabledMessage,
    isInitialMessage,
    onSendMessage,
    onNewConversation,
}: Props) => {
    const handleMessageChange = (message: string) => {
        onFormValuesChange('message', message)
    }

    const handleSubjectChange = (subject: string) => {
        onFormValuesChange('subject', subject)
    }

    const handleCustomerEmailChange = (
        customerEmail: string,
        customerName?: string | null
    ) => {
        onFormValuesChange('customerEmail', customerEmail)
        if (customerName) {
            onFormValuesChange('customerName', customerName)
        }
    }

    return (
        <div className={css.container}>
            <div
                className={classnames(css.section, {
                    [css.disabled]: !isInitialMessage,
                })}
            >
                <PlaygroundCustomerSelection
                    customerEmail={formValues.customerEmail ?? ''}
                    onCustomerEmailChange={handleCustomerEmailChange}
                    isDisabled={!isInitialMessage}
                />
            </div>
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
                    prefix={<span className="body-semibold">Subject: </span>}
                    isDisabled={!isInitialMessage}
                />
            </div>
            <div className={classnames(css.section, css.noPaddings)}>
                <PlaygroundEditor
                    value={formValues.message}
                    onChange={handleMessageChange}
                />
            </div>
            <div className={classnames(css.section, css.footer)}>
                {isDisabled && disabledMessage && (
                    <Tooltip target="send-button">{disabledMessage}</Tooltip>
                )}
                <Button
                    id="send-button"
                    isDisabled={isDisabled}
                    disabled={isDisabled}
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
