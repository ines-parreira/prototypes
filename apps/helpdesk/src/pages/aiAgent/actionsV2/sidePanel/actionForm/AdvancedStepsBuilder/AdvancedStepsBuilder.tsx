import { useEffect, useMemo, useRef, useState } from 'react'

import { createPortal } from 'react-dom'
import { ulid } from 'ulidx'

import { Box, Button, Heading, Icon, Tag } from '@gorgias/axiom'

import GuidanceReferenceProvider from 'pages/aiAgent/actions/providers/GuidanceReferenceProvider'
import StoreAppsProvider from 'pages/aiAgent/actions/providers/StoreAppsProvider'
import StoreTrackstarProvider from 'pages/aiAgent/actions/providers/StoreTrackstarProvider'
import WorkflowVisualBuilder from 'pages/automate/actionsPlatform/components/visualBuilder/WorkflowVisualBuilder'
import {
    useVisualBuilder,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import { useVisualBuilderGraphReducer } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { computeNodesPositions } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import type { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'

import { SaveChangesConfirmModal } from './SaveChangesConfirmModal'

import css from './AdvancedStepsBuilder.less'

const buildInitialConfiguration = () => {
    const builder = new WorkflowConfigurationBuilder({
        id: ulid(),
        name: '',
        initialStep: {
            id: ulid(),
            kind: 'end',
            settings: { success: true },
        },
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: '',
                    requires_confirmation: false,
                },
                deactivated_datetime: null,
            },
        ],
        triggers: [
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                    conditions: null,
                },
            },
        ],
        is_draft: false,
        apps: [],
        available_languages: [],
    })

    return builder.build()
}

type Props = {
    shopName: string
    shopType: 'shopify'
    actionName?: string
}

type FullScreenEditorProps = {
    onExit: () => void
    onSave: () => void
    actionName: string
}

const useInteractivePortalContainer = () => {
    const [container] = useState(() => {
        if (typeof document === 'undefined') return null
        const el = document.createElement('div')
        el.setAttribute('data-name', 'advanced-editor-portal')
        // The portal mounts directly under <body>, outside the React tree
        // that ThemeProvider renders. axiom components (Button, etc.) ship
        // styles scoped under `.axiom :local` — without this class on the
        // portal root, primary/tertiary buttons fall back to legacy gray.
        el.classList.add('axiom')
        return el
    })

    useEffect(() => {
        if (!container) return
        document.body.appendChild(container)
        return () => {
            container.parentElement?.removeChild(container)
        }
    }, [container])

    useEffect(() => {
        if (!container) return
        const stripBlockingAttributes = () => {
            if (container.hasAttribute('inert')) {
                container.removeAttribute('inert')
            }
            if (container.getAttribute('aria-hidden') === 'true') {
                container.removeAttribute('aria-hidden')
            }
        }
        stripBlockingAttributes()
        const observer = new MutationObserver(stripBlockingAttributes)
        observer.observe(container, {
            attributes: true,
            attributeFilter: ['inert', 'aria-hidden'],
        })
        return () => observer.disconnect()
    }, [container])

    // Axiom's bundled react-aria runs ariaHideOutside on the open SidePanel,
    // which marks every new direct child of <body> with `inert` (popover and
    // tooltip portals included). Pre-existing siblings keep their inert state;
    // only newly-mounted overlay portals get it stripped — and an attribute
    // observer keeps stripping if react-aria re-applies it.
    useEffect(() => {
        if (!container) return
        const baseline = new Set(Array.from(document.body.children))
        const attributeObservers = new Map<Element, MutationObserver>()

        const stripFrom = (element: Element) => {
            if (element.hasAttribute('inert')) {
                element.removeAttribute('inert')
            }
            if (element.getAttribute('aria-hidden') === 'true') {
                element.removeAttribute('aria-hidden')
            }
        }

        const watch = (element: Element) => {
            if (attributeObservers.has(element)) return
            stripFrom(element)
            const attrObserver = new MutationObserver(() => stripFrom(element))
            attrObserver.observe(element, {
                attributes: true,
                attributeFilter: ['inert', 'aria-hidden'],
            })
            attributeObservers.set(element, attrObserver)
        }

        const childListObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach((node) => {
                    if (
                        node instanceof Element &&
                        !baseline.has(node) &&
                        node !== container
                    ) {
                        watch(node)
                    }
                })
                mutation.removedNodes.forEach((node) => {
                    if (node instanceof Element) {
                        const attrObserver = attributeObservers.get(node)
                        if (attrObserver) {
                            attrObserver.disconnect()
                            attributeObservers.delete(node)
                        }
                    }
                })
            }
        })

        childListObserver.observe(document.body, { childList: true })

        return () => {
            childListObserver.disconnect()
            attributeObservers.forEach((observer) => observer.disconnect())
            attributeObservers.clear()
        }
    }, [container])

    return container
}

const FullScreenEditor = ({
    onExit,
    onSave,
    actionName,
}: FullScreenEditorProps) => {
    const portalContainer = useInteractivePortalContainer()
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const isConfirmOpenRef = useRef(isConfirmOpen)
    isConfirmOpenRef.current = isConfirmOpen

    // Pressing Escape inside the FullScreen editor must NOT bubble to the
    // host SidePanel (axiom's bundled react-aria would close it). We capture
    // Escape at the document level, swallow propagation, and surface the
    // "Save changes?" confirmation dialog instead.
    useEffect(() => {
        if (!portalContainer) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            event.preventDefault()
            event.stopPropagation()
            if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation()
            }
            if (isConfirmOpenRef.current) {
                setIsConfirmOpen(false)
            } else {
                setIsConfirmOpen(true)
            }
        }
        document.addEventListener('keydown', handleKeyDown, true)
        return () =>
            document.removeEventListener('keydown', handleKeyDown, true)
    }, [portalContainer])

    if (!portalContainer) return null
    return createPortal(
        <>
            <div className={css.fullScreen}>
                <header className={css.fsHeader}>
                    <Heading size="lg">{actionName}</Heading>
                    <Tag color="blue" size="md">
                        Advanced action
                    </Tag>
                </header>
                <div className={css.fsBody}>
                    <div className={css.fsStage}>
                        <WorkflowVisualBuilder />
                    </div>
                </div>
                <footer className={css.fsFooter}>
                    <Box flexDirection="row" gap="sm" alignItems="center">
                        <Button
                            as="button"
                            variant="tertiary"
                            size="md"
                            intent="regular"
                            onClick={() => setIsConfirmOpen(true)}
                        >
                            Dismiss
                        </Button>
                        <Button
                            as="button"
                            variant="primary"
                            size="md"
                            intent="regular"
                            onClick={onSave}
                        >
                            Save advanced action
                        </Button>
                    </Box>
                </footer>
            </div>
            <SaveChangesConfirmModal
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onDiscard={onExit}
                onSave={onSave}
            />
        </>,
        portalContainer,
    )
}

const InnerBuilder = ({ actionName }: { actionName: string }) => {
    const [isEditingFullScreen, setIsEditingFullScreen] = useState(false)

    const initialGraph = useMemo(
        () =>
            computeNodesPositions(
                transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                    buildInitialConfiguration(),
                    false,
                ),
            ),
        [],
    )

    const [graph, dispatch] = useVisualBuilderGraphReducer(initialGraph)
    const contextValue = useVisualBuilder<LLMPromptTriggerNodeType>(
        graph,
        dispatch,
        true,
        [],
    )

    useEffect(() => {
        if (!graph.advanced_datetime) {
            dispatch({ type: 'MIGRATE_TO_ADVANCED_STEP_BUILDER' })
        }
    }, [graph.advanced_datetime, dispatch])

    return (
        <VisualBuilderContext.Provider value={contextValue}>
            {isEditingFullScreen ? (
                <FullScreenEditor
                    actionName={actionName}
                    onExit={() => setIsEditingFullScreen(false)}
                    onSave={() => setIsEditingFullScreen(false)}
                />
            ) : (
                <div className={css.canvas}>
                    <WorkflowVisualBuilder isMiniMapHidden isDisabled />
                    <button
                        type="button"
                        className={css.editButton}
                        aria-label="Edit advanced action"
                        onClick={() => setIsEditingFullScreen(true)}
                    >
                        <Icon name="edit-pencil" size="sm" />
                    </button>
                </div>
            )}
        </VisualBuilderContext.Provider>
    )
}

export const AdvancedStepsBuilder = ({
    shopName,
    shopType,
    actionName = 'Untitled action',
}: Props) => {
    return (
        <StoreTrackstarProvider storeName={shopName} storeType={shopType}>
            <GuidanceReferenceProvider actions={[]}>
                <StoreAppsProvider storeName={shopName} storeType={shopType}>
                    <InnerBuilder actionName={actionName} />
                </StoreAppsProvider>
            </GuidanceReferenceProvider>
        </StoreTrackstarProvider>
    )
}
