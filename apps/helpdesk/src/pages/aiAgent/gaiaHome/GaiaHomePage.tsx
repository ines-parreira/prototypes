import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Icon, Menu, MenuItem, SubMenu, Tag } from '@gorgias/axiom'
import { useCopilot, useCopilotPanel } from '@gorgias/copilot'

import { CategoryLauncher } from './CategoryLauncher'
import { CreateWorkflowModal } from './CreateWorkflowModal'
import { GaiaChatOverlay } from './GaiaChatOverlay'
import {
    detectWorkflowIntent,
    MENTION_CATEGORIES,
    nextAttachmentId,
    SEED_WORKFLOWS,
    SUGGESTION_THRESHOLD,
    type Attachment,
    type Workflow,
    type WorkflowIntent,
} from './gaiaComposer'
import { gaiaComposerOrbUrl } from './gaiaComposerOrb'
import { MetricsChartCard } from './MetricsChartCard'
import css from './GaiaHomePage.less'

const OPPORTUNITIES = [
    {
        title: 'Two skills give shoppers different return windows',
        finding: '218 conversations affected last month',
        automationDelta: '8%',
    },
    {
        title: '"Order tracking" resolves below your average',
        finding: 'High volume (1,020 conversations) but 21% success',
        automationDelta: '13%',
    },
]

const PLACEHOLDERS = [
    'How can I help you today?',
    'Type / for workflows',
    'Type @ for mentions',
]

export function GaiaHomePage() {
    const [inputValue, setInputValue] = useState('')
    const [placeholderIndex, setPlaceholderIndex] = useState(0)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [pointerMode, setPointerMode] = useState(false)
    const [workflows, setWorkflows] = useState<Workflow[]>(SEED_WORKFLOWS)
    const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false)
    // Pre-fill passed to the workflow modal (set when creating from a
    // proactive suggestion; undefined for a blank "New workflow").
    const [workflowPrefill, setWorkflowPrefill] = useState<
        WorkflowIntent['prefill'] | undefined
    >(undefined)
    // "/" typeahead: reuses the same workflow dropdown as the "+" menu.
    const [isWorkflowMenuOpen, setIsWorkflowMenuOpen] = useState(false)
    // Repeated-request tracking → proactive workflow suggestion.
    const [intentCounts, setIntentCounts] = useState<Record<string, number>>({})
    const [dismissedIntents, setDismissedIntents] = useState<string[]>([])
    const [suggestion, setSuggestion] = useState<WorkflowIntent | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { sendPrompt, newThread, abort } = useCopilot()
    // When the docked Gaia side panel is open, gracefully hide the homepage
    // composer instead of competing with it.
    const { isOpen: isPanelOpen } = useCopilotPanel()

    const addAttachment = (attachment: Attachment) =>
        setAttachments((list) => [...list, attachment])

    const removeAttachment = (id: string) =>
        setAttachments((list) => list.filter((a) => a.id !== id))

    // Cycle the placeholder every few seconds while the field is empty.
    useEffect(() => {
        const id = window.setInterval(
            () =>
                setPlaceholderIndex(
                    (index) => (index + 1) % PLACEHOLDERS.length,
                ),
            3500,
        )
        return () => window.clearInterval(id)
    }, [])

    const runWorkflow = (workflow: Workflow) => {
        setIsWorkflowMenuOpen(false)
        sendPrompt(workflow.instructions)
        setIsChatOpen(true)
    }

    // Count a sent message toward its intent and, once the same intent has been
    // asked enough times (and wasn't recently dismissed), surface a suggestion.
    const trackRepeatedRequest = (message: string) => {
        const intent = detectWorkflowIntent(message)
        if (!intent) return

        const nextCount = (intentCounts[intent.id] ?? 0) + 1
        setIntentCounts((counts) => ({ ...counts, [intent.id]: nextCount }))

        if (
            nextCount >= SUGGESTION_THRESHOLD &&
            !dismissedIntents.includes(intent.id)
        ) {
            setSuggestion(intent)
        }
    }

    const dismissSuggestion = () => {
        // Don't surface this same intent again right after a dismissal.
        if (suggestion) {
            setDismissedIntents((list) => [...list, suggestion.id])
        }
        setSuggestion(null)
    }

    const openBlankWorkflow = () => {
        setWorkflowPrefill(undefined)
        setCreateWorkflowOpen(true)
    }

    const createWorkflowFromSuggestion = () => {
        if (!suggestion) return
        setWorkflowPrefill(suggestion.prefill)
        setCreateWorkflowOpen(true)
        setDismissedIntents((list) => [...list, suggestion.id])
        setSuggestion(null)
    }

    const handleSend = () => {
        const message = inputValue.trim()
        if (!message) return

        // Pass any attached references to Gaia as structured context so its
        // answer references the selected components / mentioned entities.
        const context = attachments.length
            ? `[Context — ${attachments.map((a) => a.label).join(', ')}]\n`
            : ''
        sendPrompt(context + message)
        trackRepeatedRequest(message)
        setInputValue('')
        setAttachments([])
        setIsChatOpen(true)
    }

    // Shared workflow list for both the "+" → "Run a workflow" submenu and the
    // "/" typeahead — identical items, search, selection and empty states.
    const renderWorkflowMenuItems = () => [
        ...workflows.map((workflow) => (
            <MenuItem
                key={workflow.id}
                textValue={`${workflow.shortcut} ${workflow.description ?? ''}`}
                label={workflow.shortcut}
                caption={workflow.description}
                onAction={() => runWorkflow(workflow)}
            />
        )),
        <MenuItem
            key="new-workflow"
            leadingSlot="add-plus"
            label="New workflow"
            onAction={openBlankWorkflow}
        />,
    ]

    // Pointer mode: click any selectable component to attach it as context.
    useEffect(() => {
        if (!pointerMode) return

        const onClick = (event: MouseEvent) => {
            const el = (event.target as HTMLElement).closest(
                '[data-gaia-selectable]',
            )
            if (!el) return
            // Intercept before the component's own click handler.
            event.preventDefault()
            event.stopPropagation()
            setAttachments((list) => [
                ...list,
                {
                    id: nextAttachmentId(),
                    kind: 'pointer',
                    label: el.getAttribute('data-gaia-label') || 'Component',
                },
            ])
            setPointerMode(false)
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setPointerMode(false)
        }
        document.addEventListener('click', onClick, true)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('click', onClick, true)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [pointerMode])

    const handleCloseChat = () => {
        setIsChatOpen(false)
        // Reset so the next message from the homepage starts a fresh thread.
        abort()
        newThread()
    }

    useEffect(() => {
        if (!isChatOpen) return

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleCloseChat()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChatOpen])

    return (
        <main className={`${css.main} ${pointerMode ? css.pointerMode : ''}`}>
            {pointerMode && (
                <div className={css.pointerHint}>
                    <Icon name="target" size="sm" />
                    Click a component to ask Gaia about it
                    <span className={css.pointerHintKey}>Esc to cancel</span>
                </div>
            )}
            <div className={css.surface}>
                <div className={css.content}>
                    <MetricsChartCard />

                    <div className={css.hero}>
                        <div className={css.heroEyebrow}>Welcome back!</div>
                        <h1 className={css.heroTitle}>
                            Let&rsquo;s continue growing your business
                        </h1>
                    </div>

                    <div
                        className={`${css.askSection} ${
                            isPanelOpen ? css.askSectionHidden : ''
                        }`}
                    >
                        {suggestion && (
                            <div className={css.workflowSuggestion}>
                                <span className={css.workflowSuggestionOrb}>
                                    <Icon name="ai" size="sm" />
                                </span>
                                <div className={css.workflowSuggestionBody}>
                                    <div
                                        className={css.workflowSuggestionTitle}
                                    >
                                        It looks like you ask for this regularly
                                    </div>
                                    <div className={css.workflowSuggestionText}>
                                        Would you like to turn “
                                        {suggestion.label}” into a workflow?
                                    </div>
                                </div>
                                <div className={css.workflowSuggestionActions}>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={createWorkflowFromSuggestion}
                                    >
                                        Create workflow
                                    </Button>
                                    <Button
                                        variant="tertiary"
                                        size="sm"
                                        onClick={dismissSuggestion}
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className={css.composer}>
                            <div className={css.inputBar}>
                                <img
                                    className={css.inputOrb}
                                    src={gaiaComposerOrbUrl}
                                    alt=""
                                />
                                <div className={css.inputMain}>
                                    {attachments.map((a) => (
                                        <span
                                            key={a.id}
                                            className={css.attachChip}
                                        >
                                            <Icon
                                                name={
                                                    a.kind === 'pointer'
                                                        ? 'target'
                                                        : a.kind === 'file'
                                                          ? 'paperclip-attachment'
                                                          : 'mention'
                                                }
                                                size="xs"
                                            />
                                            {a.label}
                                            <button
                                                type="button"
                                                className={css.attachRemove}
                                                aria-label="Remove"
                                                onClick={() =>
                                                    removeAttachment(a.id)
                                                }
                                            >
                                                <Icon name="close" size="xs" />
                                            </button>
                                        </span>
                                    ))}
                                    {!inputValue && !attachments.length && (
                                        <span
                                            key={placeholderIndex}
                                            className={css.inputPlaceholder}
                                        >
                                            {PLACEHOLDERS[placeholderIndex]}
                                        </span>
                                    )}
                                    <input
                                        className={css.inputField}
                                        value={inputValue}
                                        onChange={(event) => {
                                            const value = event.target.value
                                            // "/" in an empty field triggers the
                                            // workflows dropdown; the slash isn't
                                            // kept in the input.
                                            if (value === '/') {
                                                setIsWorkflowMenuOpen(true)
                                                return
                                            }
                                            setInputValue(value)
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault()
                                                handleSend()
                                            }
                                        }}
                                    />
                                    {/* Anchor + reused workflow dropdown for the
                                        "/" typeahead. */}
                                    <span
                                        className={css.workflowAnchor}
                                        aria-hidden
                                    >
                                        <Menu
                                            aria-label="Workflows"
                                            placement="top left"
                                            isOpen={isWorkflowMenuOpen}
                                            onOpenChange={setIsWorkflowMenuOpen}
                                            isSearchable
                                            searchPlaceholder="Search..."
                                            trigger={
                                                <span
                                                    className={
                                                        css.workflowAnchorDot
                                                    }
                                                />
                                            }
                                        >
                                            {renderWorkflowMenuItems()}
                                        </Menu>
                                    </span>
                                </div>
                                <div className={css.inputActions}>
                                    <Menu
                                        aria-label="Add context"
                                        placement="top left"
                                        trigger={({ isOpen }) => (
                                            <Button
                                                // Bordered "pressed" look while
                                                // the menu is open.
                                                variant={
                                                    isOpen
                                                        ? 'secondary'
                                                        : 'tertiary'
                                                }
                                                size="sm"
                                                icon="add-plus"
                                                aria-label="Add context"
                                            />
                                        )}
                                    >
                                        <MenuItem
                                            leadingSlot="target"
                                            label="Pointer"
                                            onAction={() =>
                                                setPointerMode(true)
                                            }
                                        />

                                        <SubMenu
                                            leadingSlot="mention"
                                            label="Mention"
                                        >
                                            {MENTION_CATEGORIES.map(
                                                (category) => (
                                                    <SubMenu
                                                        key={category.id}
                                                        leadingSlot={
                                                            category.icon
                                                        }
                                                        label={category.label}
                                                        isSearchable
                                                        searchPlaceholder={`Search ${category.label.toLowerCase()}...`}
                                                    >
                                                        {category.items.map(
                                                            (item) => (
                                                                <MenuItem
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    textValue={`${item.label} ${item.sublabel ?? ''}`}
                                                                    label={
                                                                        item.label
                                                                    }
                                                                    caption={
                                                                        item.sublabel
                                                                    }
                                                                    onAction={() =>
                                                                        addAttachment(
                                                                            {
                                                                                id: nextAttachmentId(),
                                                                                kind: 'mention',
                                                                                label: item.label,
                                                                                context:
                                                                                    {
                                                                                        category:
                                                                                            category.id,
                                                                                        id: item.id,
                                                                                        label: item.label,
                                                                                    },
                                                                            },
                                                                        )
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </SubMenu>
                                                ),
                                            )}
                                        </SubMenu>

                                        <SubMenu
                                            leadingSlot="zap"
                                            label="Run a workflow"
                                            isSearchable
                                            searchPlaceholder="Search..."
                                        >
                                            {renderWorkflowMenuItems()}
                                        </SubMenu>

                                        <MenuItem
                                            as={Link}
                                            to="/app/gaia-scheduled-runs"
                                            leadingSlot="calendar"
                                            label="Schedule a run"
                                        />

                                        <MenuItem
                                            leadingSlot="paperclip-attachment"
                                            label="Attach file"
                                            onAction={() =>
                                                fileInputRef.current?.click()
                                            }
                                        />
                                    </Menu>
                                    {inputValue.trim() ? (
                                        <Button
                                            intent="primary"
                                            size="sm"
                                            aria-label="Send"
                                            leadingSlot={
                                                <Icon name="send" size="sm" />
                                            }
                                            onClick={handleSend}
                                        />
                                    ) : (
                                        <Icon name="soundwave" size="sm" />
                                    )}
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                onChange={(event) => {
                                    const file = event.target.files?.[0]
                                    if (file)
                                        addAttachment({
                                            id: nextAttachmentId(),
                                            kind: 'file',
                                            label: file.name,
                                        })
                                    event.target.value = ''
                                }}
                            />

                            {createWorkflowOpen && (
                                <CreateWorkflowModal
                                    initial={workflowPrefill}
                                    onClose={() => setCreateWorkflowOpen(false)}
                                    onSave={(workflow) =>
                                        setWorkflows((list) => [
                                            workflow,
                                            ...list,
                                        ])
                                    }
                                />
                            )}
                        </div>

                        <CategoryLauncher onStarterClick={setInputValue} />
                    </div>

                    <section className={css.opportunities}>
                        <div className={css.opportunitiesHeader}>
                            <div className={css.opportunitiesHeaderTitle}>
                                For you today
                            </div>
                            <div className={css.opportunitiesHeaderSubtitle}>
                                Gaia found a few gaps that require your
                                attention
                            </div>
                        </div>

                        <div className={css.opportunityGrid}>
                            {OPPORTUNITIES.map((opportunity, index) => (
                                <div
                                    key={index}
                                    className={css.opportunityCard}
                                    data-gaia-selectable
                                    data-gaia-label={`Opportunity: ${opportunity.title}`}
                                >
                                    <div className={css.opportunityTags}>
                                        <Tag
                                            size="sm"
                                            leadingSlot={
                                                <span
                                                    className={css.criticalIcon}
                                                >
                                                    <Icon
                                                        name="arrow-chevron-up-duo"
                                                        size="xs"
                                                    />
                                                </span>
                                            }
                                        >
                                            Critical
                                        </Tag>
                                        <Tag size="sm">AI Agent</Tag>
                                    </div>
                                    <div className={css.opportunityTitle}>
                                        {opportunity.title}
                                    </div>
                                    <div className={css.opportunityFinding}>
                                        {opportunity.finding}
                                    </div>
                                    <div className={css.opportunityAutomation}>
                                        <Icon name="trending-up" size="xs" />
                                        {opportunity.automationDelta} increase
                                        on automation rate
                                    </div>
                                    <div className={css.opportunityActions}>
                                        <Button intent="primary" size="sm">
                                            Approve
                                        </Button>
                                        <Button intent="secondary" size="sm">
                                            Dismiss
                                        </Button>
                                        <Button
                                            intent="tertiary"
                                            size="sm"
                                            leadingSlot={
                                                <Icon name="ai" size="sm" />
                                            }
                                        >
                                            Ask Gaia
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            as={Link}
                            to="/app/gaia-opportunities"
                            intent="tertiary"
                            size="sm"
                        >
                            View all opportunities
                        </Button>
                    </section>
                </div>
            </div>

            {isChatOpen && <GaiaChatOverlay onClose={handleCloseChat} />}
        </main>
    )
}
