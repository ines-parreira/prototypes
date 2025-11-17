import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { shortcutManager, shortcuts } from '@repo/utils'
import classnames from 'classnames'
import { useParams } from 'react-router'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import { useSearchParam } from 'hooks/useSearchParam'
import { PlaygroundPromptType } from 'models/aiAgentPlayground/types'
import TextInput from 'pages/common/forms/input/TextInput'

import {
    PLAYGROUND_PROMPT_CONTENT,
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
} from '../../../constants'
import { usePlaygroundTracking } from '../../hooks/usePlaygroundTracking'
import type { PlaygroundCustomer } from '../../types'
import type { PlaygroundAction } from '../PlaygroundActions/types'
import type {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
    PlaygroundFormValues,
} from '../PlaygroundChat/PlaygroundChat.types'
import type { TicketData } from '../PlaygroundCustomerSelection/PlaygroundCustomerSelection'
import {
    PlaygroundCustomerSelection,
    SenderTypeValues,
} from '../PlaygroundCustomerSelection/PlaygroundCustomerSelection'
import { PlaygroundEditor } from '../PlaygroundEditor/PlaygroundEditor'
import { PlaygroundSegmentControl } from '../PlaygroundSegmentControl/PlaygroundSegmentControl'

import css from './PlaygroundInputSection.less'

const STANDALONE_CHANNEL_SEGMENTS = [
    {
        label: 'Chat',
        value: 'chat',
    },
]

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
    arePlaygroundActionsAllowed?: boolean
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
    arePlaygroundActionsAllowed,
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

    const handleSendMessage = useCallback(() => {
        onSendMessage()
        setHasMessageBeenSent(true)

        onTestMessageSent({
            channel,
            playgroundSettings:
                channel === 'email'
                    ? senderSelectedOption
                    : channelAvailability,
        })
    }, [
        onSendMessage,
        onTestMessageSent,
        channel,
        senderSelectedOption,
        channelAvailability,
    ])

    const onReset = useCallback(() => {
        onNewConversation()
        setHasMessageBeenSent(false)
    }, [onNewConversation])

    const arePlaygroundActionsAllowedRef = useRef(arePlaygroundActionsAllowed)

    useEffect(() => {
        if (
            arePlaygroundActionsAllowedRef.current !==
            arePlaygroundActionsAllowed
        ) {
            onReset()
            arePlaygroundActionsAllowedRef.current = arePlaygroundActionsAllowed
        }
    }, [arePlaygroundActionsAllowed, onReset])

    const isStandalone = useFlag(FeatureFlagKey.StandaloneHandoverCapabilities)

    // Handle keyboard shortcut for sending message (Cmd/Ctrl + Enter)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if the event originated from within the PlaygroundEditor
            const target = event.target as HTMLElement
            const isFromPlaygroundEditor =
                target.closest('.fr-element') !== null

            if (
                isFromPlaygroundEditor &&
                (event.metaKey || event.ctrlKey) &&
                event.key === 'Enter' &&
                !isDisabled &&
                !isMessageSending
            ) {
                event.preventDefault()
                handleSendMessage()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isDisabled, isMessageSending, handleSendMessage])

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
                        segments={
                            isStandalone
                                ? STANDALONE_CHANNEL_SEGMENTS
                                : CHANNEL_SEGMENTS
                        }
                    />
                    {channel === 'chat' && (
                        <PlaygroundSegmentControl
                            selectedValue={channelAvailability}
                            onValueChange={handleChannelAvailabilityChange}
                            isDisabled={!isInitialMessage}
                            segments={CHAT_AVAILABILITY_SEGMENTS}
                        />
                    )}
                    <PlaygroundCustomerSelection
                        customer={formValues.customer}
                        onCustomerChange={handleCustomerChange}
                        onTicketChange={handleTicketChange}
                        isDisabled={!isInitialMessage}
                        senderType={senderSelectedOption}
                        onSenderTypeChange={setSenderSelectedOption}
                    />
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
                {!isDisabled && (
                    <Tooltip
                        placement="top"
                        target="send-button"
                        offset="0, 4px"
                    >
                        {shortcutManager.getActionKeys(
                            shortcuts.TicketDetailContainer.actions
                                .SUBMIT_TICKET,
                        )}
                    </Tooltip>
                )}
                <Button
                    intent="secondary"
                    leadingIcon="refresh"
                    onClick={onReset}
                    isDisabled={!hasMessageBeenSent}
                    className="resetButton"
                >
                    Reset
                </Button>
            </div>
        </div>
    )
}
