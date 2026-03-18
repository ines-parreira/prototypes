import type { ComponentProps, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { SidePanel } from '@gorgias/axiom'

import useScreenSize from 'panels/hooks/useScreenSize'

import { KnowledgeEditorGuidance } from './KnowledgeEditorGuidance/KnowledgeEditorGuidance'
import { KnowledgeEditorHelpCenterArticle } from './KnowledgeEditorHelpCenterArticle/KnowledgeEditorHelpCenterArticle'
import { KnowledgeEditorSnippet } from './KnowledgeEditorSnippet/KnowledgeEditorSnippet'
import type { KnowledgeEditorSharedPanelState } from './sharedPanel.types'

type GuidanceEditorProps = {
    variant: 'guidance'
} & ComponentProps<typeof KnowledgeEditorGuidance>

type SnippetEditorProps = {
    variant: 'snippet'
} & ComponentProps<typeof KnowledgeEditorSnippet>

type HelpCenterArticleEditorProps = {
    variant: 'article'
    isOpen: boolean
} & ComponentProps<typeof KnowledgeEditorHelpCenterArticle>

type Props =
    | GuidanceEditorProps
    | SnippetEditorProps
    | HelpCenterArticleEditorProps

const MOBILE_PANEL_WIDTH_BREAKPOINT = 918
const DEFAULT_PANEL_BASE_WIDTH =
    'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))'

export const KnowledgeEditor = (props: Props) => {
    const [sharedPanelState, setSharedPanelState] =
        useState<KnowledgeEditorSharedPanelState | null>(null)
    // Cache props from the last open state so the editor keeps rendering
    // valid content during the close animation. isOpen is excluded from
    // the cached props and passed directly so children know the real state.
    const lastOpenPropsRef = useRef<Props | null>(null)
    const [windowWidth] = useScreenSize()

    useEffect(() => {
        setSharedPanelState(null)
    }, [props.variant])

    if (props.isOpen) {
        lastOpenPropsRef.current = props
    }

    const resolvedProps = props.isOpen
        ? props
        : (lastOpenPropsRef.current ?? props)

    const onSharedPanelStateChange = useCallback(
        (state: KnowledgeEditorSharedPanelState) => {
            setSharedPanelState(state)
        },
        [],
    )

    let fallbackOnClose: () => void
    let content: ReactNode

    switch (resolvedProps.variant) {
        case 'snippet': {
            const {
                variant: __variant,
                isOpen: __isOpen,
                onSharedPanelStateChange: __onSharedPanelStateChange,
                ...snippetProps
            } = resolvedProps

            fallbackOnClose = resolvedProps.onClose
            content = (
                <KnowledgeEditorSnippet
                    {...snippetProps}
                    isOpen={props.isOpen}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />
            )
            break
        }
        case 'article': {
            const {
                variant: __variant,
                isOpen: __isOpen,
                onSharedPanelStateChange: __onSharedPanelStateChange,
                ...articleProps
            } = resolvedProps

            fallbackOnClose = resolvedProps.onClose
            content = (
                <KnowledgeEditorHelpCenterArticle
                    {...articleProps}
                    isOpen={props.isOpen}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />
            )
            break
        }
        default: {
            const {
                variant: __variant,
                isOpen: __isOpen,
                onSharedPanelStateChange: __onSharedPanelStateChange,
                ...guidanceProps
            } = resolvedProps

            fallbackOnClose = resolvedProps.onClose
            content = (
                <KnowledgeEditorGuidance
                    {...guidanceProps}
                    isOpen={props.isOpen}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />
            )
            break
        }
    }

    const onRequestClose = sharedPanelState?.onRequestClose ?? fallbackOnClose
    const defaultWidth =
        windowWidth < MOBILE_PANEL_WIDTH_BREAKPOINT
            ? '100vw'
            : DEFAULT_PANEL_BASE_WIDTH
    const width = sharedPanelState?.width ?? defaultWidth

    return (
        <SidePanel
            isOpen={props.isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onRequestClose()
                }
            }}
            isDismissable
            withoutPadding
            width={width}
        >
            <div style={{ height: '100%' }}>{content}</div>
        </SidePanel>
    )
}
