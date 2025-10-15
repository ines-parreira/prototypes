import { useCallback, useEffect, useRef, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import classnames from 'classnames'
import { useParams } from 'react-router'

import { LegacyButton as Button, Tooltip } from '@gorgias/axiom'

import { FROALA_KEY } from 'config'
import keymap from 'config/shortcuts'
import { useFlag } from 'core/flags'
import TextInput from 'pages/common/forms/input/TextInput'
import FroalaEditorComponent from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent'
import shortcutManager from 'services/shortcutManager'

import { usePlaygroundContext } from '../../contexts/PlaygroundContext'
import { usePlaygroundForm } from '../../hooks/usePlaygroundForm'
import { usePlaygroundTracking } from '../../hooks/usePlaygroundTracking'
import {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
    PlaygroundCustomer,
    PlaygroundEvent,
    PlaygroundTemplateMessage,
} from '../../types'
import { mapPlaygroundFormValuesToMessage } from '../../utils/playground-messages.utils'
import {
    PlaygroundCustomerSelection,
    SenderTypeValues,
    TicketData,
} from '../PlaygroundCustomerSelection/PlaygroundCustomerSelection'
import { PlaygroundPredefinedMessages } from '../PlaygroundPredefinedMessages/PlaygroundPredefinedMessages'
import { PlaygroundSegmentControl } from '../PlaygroundSegmentControl/PlaygroundSegmentControl'

import css from './PlaygroundInputSection.less'

const TOOLBAR_CONTAINER_ID = 'froalaToolbarContainer'

// cf https://froala.com/wysiwyg-editor/docs/options
const froalaConfig = {
    key: FROALA_KEY,
    attribution: false,
    toolbarSticky: false,
    typingTimer: 150,
    toolbarBottom: true,
    quickInsertEnabled: false,
    charCounterCount: false,
    toolbarButtons: ['emoticons', 'insertLink'],
    toolbarContainer: `#${TOOLBAR_CONTAINER_ID}`,
}

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
    shouldDisplayResetButton: boolean
}

export const PlaygroundInputSection = ({ shouldDisplayResetButton }: Props) => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const {
        storeConfiguration,
        snippetHelpCenterId,
        events,
        uiState,
        channelState,
        messagesState,
    } = usePlaygroundContext()

    const {
        channel,
        channelAvailability,
        onChannelChange,
        onChannelAvailabilityChange,
    } = channelState

    const { onMessageSend, isMessageSending } = messagesState

    const {
        formValues,
        isFormValid,
        isDisabled,
        disabledMessage,
        onFormValuesChange,
        clearForm,
    } = usePlaygroundForm({
        shopName,
        snippetHelpCenterId: snippetHelpCenterId || 0,
        helpCenterId: storeConfiguration?.helpCenterId ?? null,
    })

    const [senderSelectedOption, setSenderSelectedOption] = useState<string>(
        SenderTypeValues.NEW_CUSTOMER,
    )
    const [hasMessageBeenSent, setHasMessageBeenSent] = useState(false)

    const subjectInputRef = useRef<HTMLInputElement | null>(null)

    const { onTestMessageSent } = usePlaygroundTracking({ shopName })

    const isStandalone = useFlag(
        FeatureFlagKey.StandaloneHandoverCapabilities,
        false,
    )

    const { isInitialMessage } = uiState

    const handleMessageChange = (message: string) => {
        onFormValuesChange('message', message)
    }

    const handleSubjectChange = (subject: string) => {
        onFormValuesChange('subject', subject)
    }

    useEffect(() => {
        return events.on(PlaygroundEvent.RESET_CONVERSATION, clearForm)
    }, [events, clearForm])

    const handlePredefinedMessageSelect = (
        message: PlaygroundTemplateMessage,
    ) => {
        onFormValuesChange('message', message.content)
        onFormValuesChange('subject', message.title)
    }

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

    const handleSendMessage = useCallback(() => {
        if (!isFormValid) {
            return
        }

        if (!onMessageSend || !formValues) {
            return
        }

        const playgroundMessage = mapPlaygroundFormValuesToMessage(formValues)
        void onMessageSend(playgroundMessage, {
            customer: formValues.customer,
            subject: formValues.subject,
        })

        onFormValuesChange('message', '')
        setHasMessageBeenSent(true)

        onTestMessageSent({
            channel,
            playgroundSettings:
                channel === 'email'
                    ? senderSelectedOption
                    : channelAvailability,
        })
    }, [
        isFormValid,
        onMessageSend,
        formValues,
        onFormValuesChange,
        onTestMessageSent,
        channel,
        senderSelectedOption,
        channelAvailability,
    ])

    const onReset = useCallback(() => {
        events.emit(PlaygroundEvent.RESET_CONVERSATION)
        clearForm()
        setHasMessageBeenSent(false)
    }, [events, clearForm])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
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

    const isFormDisabled = isDisabled || isMessageSending

    return (
        <div className={css.container}>
            <div
                className={classnames(css.section, css.topSection, {
                    [css.disabled]: !isInitialMessage,
                })}
            >
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
                        placeholder="Subject"
                        isDisabled={!isInitialMessage}
                    />
                </div>
            )}
            <div className={classnames(css.section, css.editor)}>
                <div className={css.froalaEditor}>
                    <FroalaEditorComponent
                        model={formValues.message}
                        tag="textarea"
                        config={{
                            ...froalaConfig,
                            placeholderText: 'Write your message...',
                        }}
                        onModelChange={handleMessageChange}
                    />

                    <PlaygroundPredefinedMessages
                        onMessageSelect={handlePredefinedMessageSelect}
                        isVisible={
                            isInitialMessage && !formValues.message?.trim()
                        }
                    />
                    <div id={TOOLBAR_CONTAINER_ID}>
                        {isFormDisabled && disabledMessage && (
                            <Tooltip target="send-button">
                                {disabledMessage}
                            </Tooltip>
                        )}
                        <Button
                            id="send-button"
                            isDisabled={isFormDisabled}
                            onClick={handleSendMessage}
                        >
                            Send
                        </Button>
                        {!isFormDisabled && (
                            <Tooltip
                                placement="top"
                                target="send-button"
                                offset="0, 4px"
                            >
                                {shortcutManager.getActionKeys(
                                    keymap.TicketDetailContainer.actions
                                        .SUBMIT_TICKET,
                                )}
                            </Tooltip>
                        )}
                        {shouldDisplayResetButton && (
                            <Button
                                intent="secondary"
                                leadingIcon="refresh"
                                onClick={onReset}
                                isDisabled={!hasMessageBeenSent}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
