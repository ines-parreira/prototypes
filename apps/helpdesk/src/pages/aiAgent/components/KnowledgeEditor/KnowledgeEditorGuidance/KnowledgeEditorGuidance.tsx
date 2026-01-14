import { useEffect, useRef } from 'react'

import { Card, SidePanel } from '@gorgias/axiom'

import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import { KnowledgeEditorLoadingShell } from '../KnowledgeEditorLoadingShell'
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
}

const KnowledgeEditorGuidanceInner = ({
    isLoading,
}: {
    isLoading: boolean
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

    return (
        <SidePanel
            isOpen={true}
            onOpenChange={(open) => {
                if (!open) {
                    if (closeHandlerRef.current) {
                        closeHandlerRef.current()
                    } else {
                        config.onClose()
                    }
                }
            }}
            isDismissable
            withoutPadding
            width={playground.sidePanelWidth}
        >
            {isLoading ? (
                <KnowledgeEditorLoadingShell />
            ) : (
                <div className={css.splitView}>
                    <Card elevation="mid" padding={0} width={'100%'}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </Card>
                    {playground.isOpen && (
                        <div className={css.playground}>
                            <PlaygroundPanel
                                onClose={playground.onClose}
                                draftKnowledge={draftKnowledgeForPlayground}
                            />
                        </div>
                    )}
                </div>
            )}
        </SidePanel>
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
}: Props) => {
    const guidanceHelpCenter = useAiAgentHelpCenter({
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
            />
        </KnowledgeEditorGuidanceProvider>
    )
}
