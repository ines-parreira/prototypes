import { useEffect, useReducer, useRef, useState } from 'react'
import { Button, Icon } from '@gorgias/axiom'
import { useCopilot } from '@gorgias/copilot'

import type { WorkflowIntent } from './gaiaComposer'
import css from './GaiaHomePage.less'

type Props = {
    onClose: () => void
    // Optional proactive opener shown as Gaia's first message (e.g. the
    // explanation for a specific opportunity), plus quick follow-up prompts.
    // When omitted, the panel opens to the normal empty Gaia state.
    intro?: { message: string; suggestions?: string[] }
    // Called for every message the merchant sends here, so repeated-request
    // detection keeps counting inside the chat (not just the homepage).
    onUserSend?: (message: string) => void
    // Proactive workflow suggestion surfaced in the thread once the threshold
    // is reached.
    suggestion?: WorkflowIntent | null
    onCreateWorkflow?: () => void
    onDismissSuggestion?: () => void
}

type ChatMessage = {
    id: string
    role: 'user' | 'assistant'
    text: string
}

// A message's content can be a plain string or an array of content parts
// (text/tool/etc.) depending on how the agent streamed it. Normalize to text
// so rendering never assumes a string.
function getMessageText(content: unknown): string {
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
        return content
            .map((part) =>
                typeof part === 'string'
                    ? part
                    : ((part as { text?: string })?.text ?? ''),
            )
            .join('')
    }
    return ''
}

/**
 * Centered, single-column Gaia chat shown full-screen over the homepage.
 *
 * Rather than embedding the docked CopilotPanel (which carries its own
 * split/conversation-list shell), this reads the live conversation straight
 * from the shared copilot agent and renders it in the homepage's visual
 * language: stacked bubbles in a centered column with the same composer.
 */
export function GaiaChatOverlay({
    onClose,
    intro,
    onUserSend,
    suggestion,
    onCreateWorkflow,
    onDismissSuggestion,
}: Props) {
    const { agent, sendPrompt } = useCopilot()
    const [, forceRender] = useReducer((value: number) => value + 1, 0)
    const [draft, setDraft] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    // The agent mutates in place as messages stream in — subscribe so the
    // view re-renders on every conversation/run change.
    useEffect(() => {
        if (!agent?.subscribe) return
        const { unsubscribe } = agent.subscribe({
            onMessagesChanged: () => forceRender(),
            onNewMessage: () => forceRender(),
            onStateChanged: () => forceRender(),
            onRunStartedEvent: () => forceRender(),
            onRunFinishedEvent: () => forceRender(),
            onRunFinalized: () => forceRender(),
            onRunFailed: () => forceRender(),
        })
        return unsubscribe
    }, [agent])

    const messages: ChatMessage[] = (agent?.messages ?? [])
        .filter(
            (message) =>
                message.role === 'user' || message.role === 'assistant',
        )
        .map((message) => ({
            id: message.id,
            role: message.role as 'user' | 'assistant',
            text: getMessageText(message.content),
        }))
        .filter((message) => message.text.trim().length > 0)

    // Keep the latest message in view as the conversation grows / streams.
    useEffect(() => {
        const element = scrollRef.current
        if (element) element.scrollTop = element.scrollHeight
    })

    const lastMessage = messages[messages.length - 1]
    const isThinking =
        !!agent?.isRunning && (!lastMessage || lastMessage.role === 'user')

    const handleSend = () => {
        const text = draft.trim()
        if (!text) return
        sendPrompt(text)
        onUserSend?.(text)
        setDraft('')
    }

    return (
        <div className={css.chatOverlay} role="dialog" aria-modal="true">
            <header className={css.chatHeader}>
                <span className={css.chatTitle}>Gaia</span>
                <button
                    type="button"
                    className={css.chatOverlayClose}
                    aria-label="Close chat"
                    onClick={onClose}
                >
                    <Icon name="close" size="md" />
                </button>
            </header>

            <div ref={scrollRef} className={css.chatScroll}>
                <div className={css.chatThread}>
                    {intro && (
                        <div className={css.bubbleAssistant}>
                            {intro.message}
                        </div>
                    )}

                    {intro?.suggestions && messages.length === 0 && (
                        <div className={css.chatSuggestions}>
                            {intro.suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    className={css.chatSuggestionChip}
                                    onClick={() => sendPrompt(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={
                                message.role === 'user'
                                    ? css.bubbleUser
                                    : css.bubbleAssistant
                            }
                        >
                            {message.text}
                        </div>
                    ))}

                    {isThinking && (
                        <div className={css.bubbleAssistant}>
                            <span className={css.typingDots}>
                                <span />
                                <span />
                                <span />
                            </span>
                        </div>
                    )}

                    {suggestion && (
                        <div className={css.workflowSuggestion}>
                            <span className={css.workflowSuggestionOrb}>
                                <Icon name="ai" size="sm" />
                            </span>
                            <div className={css.workflowSuggestionBody}>
                                <div className={css.workflowSuggestionTitle}>
                                    It looks like you ask for this regularly
                                </div>
                                <div className={css.workflowSuggestionText}>
                                    Would you like to turn “{suggestion.label}”
                                    into a workflow?
                                </div>
                            </div>
                            <div className={css.workflowSuggestionActions}>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={onCreateWorkflow}
                                >
                                    Create workflow
                                </Button>
                                <Button
                                    variant="tertiary"
                                    size="sm"
                                    onClick={onDismissSuggestion}
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={css.chatComposer}>
                <div className={css.inputBar}>
                    <span className={css.inputOrb} />
                    <input
                        className={css.inputField}
                        placeholder="Ask anything…"
                        value={draft}
                        autoFocus
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault()
                                handleSend()
                            }
                        }}
                    />
                    <div className={css.inputActions}>
                        <Icon name="add-plus" size="sm" />
                        {draft.trim() ? (
                            <Button
                                intent="primary"
                                size="sm"
                                aria-label="Send"
                                leadingSlot={<Icon name="send" size="sm" />}
                                onClick={handleSend}
                            />
                        ) : (
                            <Icon name="soundwave" size="sm" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
