import type { ComponentProps, ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'

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
    const [windowWidth] = useScreenSize()

    useEffect(() => {
        setSharedPanelState(null)
    }, [props.variant])

    const onSharedPanelStateChange = useCallback(
        (state: KnowledgeEditorSharedPanelState) => {
            setSharedPanelState(state)
        },
        [],
    )

    let isOpen = true
    let fallbackOnClose: () => void
    let content: ReactNode

    switch (props.variant) {
        case 'snippet': {
            const {
                variant: __variant,
                onSharedPanelStateChange: __onSharedPanelStateChange,
                ...snippetProps
            } = props

            isOpen = props.isOpen
            fallbackOnClose = props.onClose
            content = (
                <KnowledgeEditorSnippet
                    {...snippetProps}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />
            )
            break
        }
        case 'article': {
            const {
                variant: __variant,
                onSharedPanelStateChange: __onSharedPanelStateChange,
                ...articleProps
            } = props

            fallbackOnClose = props.onClose
            content = (
                <KnowledgeEditorHelpCenterArticle
                    {...articleProps}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />
            )
            break
        }
        default: {
            const {
                variant: __variant,
                onSharedPanelStateChange: __onSharedPanelStateChange,
                ...guidanceProps
            } = props

            isOpen = props.isOpen
            fallbackOnClose = props.onClose
            content = (
                <KnowledgeEditorGuidance
                    {...guidanceProps}
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

    if (!isOpen) {
        return null
    }

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onRequestClose()
                }
            }}
            isDismissable
            withoutPadding
            width={width}
        >
            {content}
        </SidePanel>
    )
}
