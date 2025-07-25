import React, {
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'

import classnames from 'classnames'
import { useParams } from 'react-router'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { useSearchParam } from 'hooks/useSearchParam'
import { PlaygroundPromptType } from 'models/aiAgentPlayground/types'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'

import {
    PLAYGROUND_PROMPT_CONTENT,
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
} from '../../../constants'
import { usePlaygroundTracking } from '../../hooks/usePlaygroundTracking'
import { PlaygroundCustomer } from '../../types'
import { PlaygroundAction } from '../PlaygroundActions/types'
import {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
    PlaygroundFormValues,
} from '../PlaygroundChat/PlaygroundChat.types'
import {
    PlaygroundCustomerSelection,
    SenderTypeValues,
    TicketData,
} from '../PlaygroundCustomerSelection/PlaygroundCustomerSelection'
import { PlaygroundEditor } from '../PlaygroundEditor/PlaygroundEditor'
import { PlaygroundSegmentControl } from '../PlaygroundSegmentControl/PlaygroundSegmentControl'

import css from './PlaygroundInputSection.less'

const CHANNEL_SEGMENTS = [
    {
        label: 'Email',
        value: 'email',
    },
    {
        label: 'Chat',
        value: 'chat',
    },
]

const CHAT_AVAILABILITY_SEGMENTS = [
    {
        label: 'Online',
        value: 'online',
    },
    {
        label: 'Offline',
        value: 'offline',
    },
]

type Props = {
    formValues: PlaygroundFormValues
    onFormValuesChange: <Key extends keyof PlaygroundFormValues>(
        key: Key,
        value: PlaygroundFormValues[Key],
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
    channelAvailability: PlaygroundChannelAvailability
    onChannelAvailabilityChange: (value: PlaygroundChannelAvailability) => void
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
    channelAvailability,
    onChannelAvailabilityChange,
}: Props) => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const handleMessageChange = (message: string) => {
        onFormValuesChange('message', message)
    }
    const [senderSelectedOption, setSenderSelectedOption] = useState<string>(
        SenderTypeValues.NEW_CUSTOMER,
    )
    const [hasMessageBeenSent, setHasMessageBeenSent] = useState(false)

    const [wizardQueryParam, setWizardQueryParam] = useSearchParam(
        WIZARD_POST_COMPLETION_QUERY_KEY,
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
                          PlaygroundPromptType.NOT_RELEVANT_RESPONSE,
                      )
                  },
              },
          ]
        : undefined

    const handleCustomerChange = useCallback(
        (customer: PlaygroundCustomer) => {
            onFormValuesChange('customer', customer)
        },
        [onFormValuesChange],
    )

    const handleTicketChange = useCallback(
        (ticketData: TicketData) => {
            onFormValuesChange('customer', ticketData.customer)
            onFormValuesChange('subject', ticketData.subject)
            onFormValuesChange('message', ticketData.message)
        },
        [onFormValuesChange],
    )

    const handleChannelChange = useCallback(
        (value: string) => {
            onChannelChange(value as PlaygroundChannels)
        },
        [onChannelChange],
    )

    const handleChannelAvailabilityChange = useCallback(
        (value: string) => {
            onChannelAvailabilityChange(value as PlaygroundChannelAvailability)
        },
        [onChannelAvailabilityChange],
    )

    const { onTestMessageSent } = usePlaygroundTracking({ shopName })

    const handleSendMessage = () => {
        onSendMessage()
        setHasMessageBeenSent(true)

        onTestMessageSent({
            channel,
            playgroundSettings:
                channel === 'email'
                    ? senderSelectedOption
                    : channelAvailability,
        })
    }

    return (
        <div className={css.container}>
            <div
                className={classnames(css.section, {
                    [css.disabled]: !isInitialMessage,
                })}
            >
                <div className={css.topSection}>
                    <PlaygroundSegmentControl
                        selectedValue={channel}
                        onValueChange={handleChannelChange}
                        isDisabled={!isInitialMessage}
                        segments={CHANNEL_SEGMENTS}
                    />
                    {channel === 'chat' && (
                        <PlaygroundSegmentControl
                            selectedValue={channelAvailability}
                            onValueChange={handleChannelAvailabilityChange}
                            isDisabled={!isInitialMessage}
                            segments={CHAT_AVAILABILITY_SEGMENTS}
                        />
                    )}
                    {channel === 'email' && (
                        <PlaygroundCustomerSelection
                            customer={formValues.customer}
                            onCustomerChange={handleCustomerChange}
                            onTicketChange={handleTicketChange}
                            isDisabled={!isInitialMessage}
                            senderType={senderSelectedOption}
                            onSenderTypeChange={setSenderSelectedOption}
                        />
                    )}
                </div>
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
                    onClick={handleSendMessage}
                >
                    Send
                </Button>
                <Button
                    intent="secondary"
                    onClick={() => {
                        onNewConversation()
                        setHasMessageBeenSent(false)
                    }}
                    isDisabled={
                        !formValues.message.trim() && !hasMessageBeenSent
                    }
                >
                    Reset
                </Button>
            </div>
        </div>
    )
}
