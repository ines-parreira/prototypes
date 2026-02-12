import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { shortcutManager, shortcuts } from '@repo/utils'
import classnames from 'classnames'
import { useParams } from 'react-router'

import { Button, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { FROALA_KEY } from 'config'
import { MESSAGE_SENT_AI_AGENT_PLAYGROUND_EVENT } from 'pages/aiAgent/constants'
import { AI_AGENT_SENDER } from 'pages/aiAgent/PlaygroundV2/constants'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import {
    useEvents,
    useSubscribeToEvent,
} from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import { useSettingsContext } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'
import TextInput from 'pages/common/forms/input/TextInput'
import { FroalaEditor } from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/froala-config'
import FroalaEditorComponent from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent'

import { useMessagesContext } from '../../contexts/MessagesContext'
import { usePlaygroundForm } from '../../hooks/usePlaygroundForm'
import { usePlaygroundTracking } from '../../hooks/usePlaygroundTracking'
import type { PlaygroundTemplateMessage } from '../../types'
import { PlaygroundEvent } from '../../types'
import { mapPlaygroundFormValuesToMessage } from '../../utils/playground-messages.utils'
import { PlaygroundPredefinedMessages } from '../PlaygroundPredefinedMessages/PlaygroundPredefinedMessages'

import css from './PlaygroundInputSection.less'

const TOOLBAR_CONTAINER_ID = 'froalaToolbarContainer'

const DISABLED_MESSAGE_DRAFT_KNOWLEDGE =
    'Your draft updates are being synced for testing.'

FroalaEditor.DefineIcon('emoticons', {
    NAME: 'sentiment_satisfied',
    template: 'material_design',
})

FroalaEditor.DefineIcon('insertLink', {
    NAME: 'insert_link',
    template: 'material_design',
})

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

type Props = {
    withResetButton: boolean
}

export const PlaygroundInputSection = ({ withResetButton }: Props) => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const { channel, isDraftKnowledgeReady } = useCoreContext()

    const { onMessageSend, isMessageSending, messages } = useMessagesContext()

    const { snippetHelpCenterId, storeConfiguration } =
        useConfigurationContext()

    const { mode } = useSettingsContext()

    const events = useEvents()

    const isInitialMessage = useMemo(() => {
        return !messages.some((message) => message.sender !== AI_AGENT_SENDER)
    }, [messages])

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
        guidanceHelpCenterId: storeConfiguration?.guidanceHelpCenterId ?? null,
    })

    const [hasMessageBeenSent, setHasMessageBeenSent] = useState(false)

    const subjectInputRef = useRef<HTMLInputElement | null>(null)

    const { onTestMessageSent } = usePlaygroundTracking({ shopName })

    const handleMessageChange = (message: string) => {
        onFormValuesChange('message', message)
    }

    const handleSubjectChange = (subject: string) => {
        onFormValuesChange('subject', subject)
    }

    useSubscribeToEvent(PlaygroundEvent.RESET_CONVERSATION, clearForm)

    const handlePredefinedMessageSelect = (
        message: PlaygroundTemplateMessage,
    ) => {
        onFormValuesChange('message', message.content)
        onFormValuesChange('subject', message.title)
    }

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

        document.dispatchEvent(
            new CustomEvent(MESSAGE_SENT_AI_AGENT_PLAYGROUND_EVENT),
        )

        onTestMessageSent({ channel })
    }, [
        isFormValid,
        onMessageSend,
        formValues,
        onFormValuesChange,
        onTestMessageSent,
        channel,
    ])

    const onReset = useCallback(() => {
        events.emit(PlaygroundEvent.RESET_CONVERSATION)
        clearForm()
        setHasMessageBeenSent(false)
    }, [clearForm, events])

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

    const isFormDisabled =
        isDisabled || isMessageSending || !isDraftKnowledgeReady

    const sendMessageTooltip = useMemo(() => {
        if (!isDraftKnowledgeReady) {
            return DISABLED_MESSAGE_DRAFT_KNOWLEDGE
        }
        if (isFormDisabled && disabledMessage) {
            return disabledMessage
        }

        return null
    }, [isDraftKnowledgeReady, disabledMessage, isFormDisabled])

    return (
        <div className={css.container}>
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
                        aria-label="Email subject"
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

                    {mode !== 'outbound' && (
                        <PlaygroundPredefinedMessages
                            onMessageSelect={handlePredefinedMessageSelect}
                            isVisible={
                                isInitialMessage && !formValues.message?.trim()
                            }
                        />
                    )}
                    <div id={TOOLBAR_CONTAINER_ID}>
                        {sendMessageTooltip && (
                            <Tooltip target="send-button">
                                {sendMessageTooltip}
                            </Tooltip>
                        )}
                        <Button
                            id="send-button"
                            isDisabled={isFormDisabled}
                            onClick={handleSendMessage}
                            size="sm"
                            aria-label="Send message"
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
                                    shortcuts.TicketDetailContainer.actions
                                        .SUBMIT_TICKET,
                                )}
                            </Tooltip>
                        )}
                        {withResetButton && (
                            <Button
                                variant="secondary"
                                onClick={onReset}
                                isDisabled={!hasMessageBeenSent}
                                size="sm"
                                aria-label="Reset conversation"
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
