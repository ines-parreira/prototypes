import { useCallback, useEffect, useRef } from 'react'

import cn from 'classnames'

import { Card } from '@gorgias/axiom'

import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import { KnowledgeEditorLoadingShell } from '../KnowledgeEditorLoadingShell'
import type { KnowledgeEditorSharedPanelState } from '../sharedPanel.types'
import { KnowledgeEditorGuidanceProvider, useGuidanceContext } from './context'
import type { GuidanceContextConfig, GuidanceModeType } from './context'
import { KnowledgeEditorGuidanceContent } from './KnowledgeEditorGuidanceContent'

import css from '../shared.less'

type Props = {
    shopName: string
    shopType: string
    guidanceArticleId?: number
    guidanceTemplate?: GuidanceTemplate
    guidanceArticles: FilteredKnowledgeHubArticle[]
    onDelete?: () => void
    onCreate?: () => void
    onUpdate?: () => void
    onCopy?: () => void
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    guidanceMode: GuidanceModeType
    isOpen: boolean
    handleVisibilityUpdate?: (visibility: string) => void
    onSharedPanelStateChange?: (state: KnowledgeEditorSharedPanelState) => void
}

const KnowledgeEditorGuidanceInner = ({
    isLoading,
    onSharedPanelStateChange,
}: {
    isLoading: boolean
    onSharedPanelStateChange?: (state: KnowledgeEditorSharedPanelState) => void
}) => {
    const closeHandlerRef = useRef<(() => void) | null>(null)

    const { playground, config, state } = useGuidanceContext()
    const isGuidanceInDraftState =
        state.guidance?.isCurrent === undefined
            ? false
            : !state.guidance?.isCurrent

    const draftKnowledgeForPlayground =
        isGuidanceInDraftState && state.guidance
            ? {
                  sourceId: state.guidance.id,
                  sourceSetId: config.guidanceHelpCenter.id,
              }
            : undefined

    const { onClose } = config

    const onRequestClose = useCallback(() => {
        if (closeHandlerRef.current) {
            closeHandlerRef.current()
            return
        }

        onClose()
    }, [onClose])

    useEffect(() => {
        if (!onSharedPanelStateChange) {
            return
        }

        onSharedPanelStateChange({
            width: playground.sidePanelWidth,
            onRequestClose,
        })
    }, [onSharedPanelStateChange, playground.sidePanelWidth, onRequestClose])

    if (isLoading) {
        return <KnowledgeEditorLoadingShell />
    }

    return (
        <div className={css.splitView}>
            <Card elevation="mid" className={css.editor} padding={0}>
                <KnowledgeEditorGuidanceContent
                    closeHandlerRef={closeHandlerRef}
                />
            </Card>
            <div
                className={cn(
                    css.playground,
                    playground.isOpen
                        ? css['playground-open']
                        : css['playground-closed'],
                )}
            >
                <PlaygroundPanel
                    onClose={playground.onClose}
                    draftKnowledge={draftKnowledgeForPlayground}
                />
            </div>
        </div>
    )
}

export const KnowledgeEditorGuidance = ({
    shopName,
    shopType,
    guidanceArticleId,
    guidanceTemplate,
    guidanceArticles,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
    onDelete,
    onCreate,
    onUpdate,
    onCopy,
    isOpen,
    handleVisibilityUpdate,
    onSharedPanelStateChange,
}: Props) => {
    const {
        helpCenter: guidanceHelpCenter,
        isLoading: isGuidanceHelpCenterLoading,
    } = useAiAgentHelpCenterState({
        shopName: shopName,
        helpCenterType: 'guidance',
    })

    const { guidanceArticle, isGuidanceArticleLoading, isError, error } =
        useGuidanceArticle({
            guidanceHelpCenterId: guidanceHelpCenter?.id ?? 0,
            guidanceArticleId: guidanceArticleId ?? 0,
            locale: guidanceHelpCenter?.default_locale ?? 'en-US',
            versionStatus: 'latest_draft',
            enabled:
                !!guidanceArticleId &&
                !!guidanceHelpCenter?.id &&
                guidanceMode !== 'create',
        })

    const { error: notifyError } = useNotify()

    useEffect(() => {
        // Only show error if editor is actually open and attempting to display content
        if (isError && guidanceArticleId && error) {
            // Check if it's a 404 error
            const is404 =
                isGorgiasApiError(error) && error.response.status === 404

            const message = is404
                ? 'This article is no longer available. It may have been deleted.'
                : 'Unable to load this article. Please try again or contact support.'

            notifyError(message)
            onClose()
        }
    }, [isError, guidanceArticleId, error, isOpen, notifyError, onClose])
    if (!isOpen) {
        return null
    }

    if (isGuidanceHelpCenterLoading) {
        return <KnowledgeEditorLoadingShell />
    }

    if (!guidanceHelpCenter) {
        return null
    }

    const config: GuidanceContextConfig = {
        shopName,
        shopType,
        guidanceTemplate,
        guidanceArticles,
        initialMode: guidanceMode,
        guidanceArticle,
        guidanceHelpCenter,
        onClose,
        onClickPrevious,
        onClickNext,
        onDeleteFn: onDelete,
        onCreateFn: onCreate,
        onUpdateFn: onUpdate,
        onCopyFn: onCopy,
        handleVisibilityUpdate,
    }

    return (
        <KnowledgeEditorGuidanceProvider config={config}>
            <KnowledgeEditorGuidanceInner
                isLoading={!!guidanceArticleId && isGuidanceArticleLoading}
                onSharedPanelStateChange={onSharedPanelStateChange}
            />
        </KnowledgeEditorGuidanceProvider>
    )
}
