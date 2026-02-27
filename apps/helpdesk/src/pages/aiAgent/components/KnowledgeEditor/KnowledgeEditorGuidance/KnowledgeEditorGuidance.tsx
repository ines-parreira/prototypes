import { useCallback, useEffect, useMemo, useRef } from 'react'

import cn from 'classnames'
import { useShallow } from 'zustand/react/shallow'

import { Card } from '@gorgias/axiom'

import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import { KnowledgeEditorLoadingShell } from '../KnowledgeEditorLoadingShell'
import type { KnowledgeEditorSharedPanelState } from '../sharedPanel.types'
import { KnowledgeEditorGuidanceProvider, useGuidanceStore } from './context'
import type { GuidanceContextConfig, GuidanceModeType } from './context'
import { KnowledgeEditorGuidanceContent } from './KnowledgeEditorGuidanceContent'
import { useKnowledgeEditorGuidanceData } from './useKnowledgeEditorGuidanceData'

import css from '../shared.less'

type Props = {
    shopName: string
    shopType: string
    guidanceArticleId?: number
    guidanceTemplate?: GuidanceTemplate
    onDelete?: () => void
    onCreate?: (
        guidance: {
            id: number
            locale: string
        },
        shouldAddToMissingKnowledge?: boolean,
    ) => void
    onUpdate?: () => void
    onCopy?: () => void
    onEdit?: () => void
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    guidanceMode: GuidanceModeType
    isOpen: boolean
    handleVisibilityUpdate?: (visibility: string) => void
    onSharedPanelStateChange?: (state: KnowledgeEditorSharedPanelState) => void
    showMissingKnowledgeCheckbox?: boolean
}

const KnowledgeEditorGuidanceInner = ({
    isLoading,
    onSharedPanelStateChange,
}: {
    isLoading: boolean
    onSharedPanelStateChange?: (state: KnowledgeEditorSharedPanelState) => void
}) => {
    const closeHandlerRef = useRef<(() => void) | null>(null)

    const { playground, onClose, guidance, guidanceHelpCenterId } =
        useGuidanceStore(
            useShallow((storeState) => ({
                playground: storeState.playground,
                onClose: storeState.config.onClose,
                guidance: storeState.state.guidance,
                guidanceHelpCenterId: storeState.config.guidanceHelpCenter.id,
            })),
        )

    const isGuidanceInDraftState =
        guidance?.isCurrent === undefined ? false : !guidance?.isCurrent

    const draftKnowledgeForPlayground =
        isGuidanceInDraftState && guidance
            ? {
                  sourceId: guidance.id,
                  sourceSetId: guidanceHelpCenterId,
              }
            : undefined

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
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
    onDelete,
    onCreate,
    onUpdate,
    onCopy,
    onEdit,
    isOpen,
    handleVisibilityUpdate,
    onSharedPanelStateChange,
    showMissingKnowledgeCheckbox,
}: Props) => {
    const {
        guidanceHelpCenter,
        isGuidanceHelpCenterLoading,
        guidanceArticles,
        guidanceArticle,
        isGuidanceArticleLoading,
        isError,
        error,
    } = useKnowledgeEditorGuidanceData({
        shopName,
        guidanceArticleId,
        guidanceMode,
    })
    const { error: notifyError } = useNotify()

    useEffect(() => {
        // Only show error if editor is actually open and attempting to display content
        if (isOpen && isError && guidanceArticleId && error) {
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
    const memoizedConfig = useMemo<GuidanceContextConfig | null>(() => {
        if (!guidanceHelpCenter) {
            return null
        }

        return {
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
            onEditFn: onEdit,
            handleVisibilityUpdate,
            showMissingKnowledgeCheckbox,
        }
    }, [
        shopName,
        shopType,
        guidanceTemplate,
        guidanceArticles,
        guidanceMode,
        guidanceArticle,
        guidanceHelpCenter,
        onClose,
        onClickPrevious,
        onClickNext,
        onDelete,
        onCreate,
        onUpdate,
        onCopy,
        onEdit,
        handleVisibilityUpdate,
        showMissingKnowledgeCheckbox,
    ])

    if (!isOpen) {
        return null
    }

    if (isGuidanceHelpCenterLoading) {
        return <KnowledgeEditorLoadingShell />
    }

    if (!memoizedConfig) {
        return null
    }

    return (
        <KnowledgeEditorGuidanceProvider config={memoizedConfig}>
            <KnowledgeEditorGuidanceInner
                isLoading={!!guidanceArticleId && isGuidanceArticleLoading}
                onSharedPanelStateChange={onSharedPanelStateChange}
            />
        </KnowledgeEditorGuidanceProvider>
    )
}
