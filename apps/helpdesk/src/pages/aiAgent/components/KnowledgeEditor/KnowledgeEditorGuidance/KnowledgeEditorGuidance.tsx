import { useRef } from 'react'

import { LegacyLoadingSpinner, SidePanel } from '@gorgias/axiom'

import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
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
}

const KnowledgeEditorGuidanceInner = () => {
    const closeHandlerRef = useRef<(() => void) | null>(null)

    const { playground, config } = useGuidanceContext()

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
            <div className={css.splitView}>
                <div className={css.editor}>
                    <KnowledgeEditorGuidanceContent
                        closeHandlerRef={closeHandlerRef}
                    />
                </div>
                {playground.isOpen && (
                    <div className={css.playground}>
                        <PlaygroundPanel onClose={playground.onClose} />
                    </div>
                )}
            </div>
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
}: Props) => {
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName: shopName,
        helpCenterType: 'guidance',
    })

    const { guidanceArticle, isGuidanceArticleLoading } = useGuidanceArticle({
        guidanceHelpCenterId: guidanceHelpCenter?.id ?? 0,
        guidanceArticleId: guidanceArticleId ?? 0,
        locale: guidanceHelpCenter?.default_locale ?? 'en-US',
        versionStatus: 'latest_draft',
        enabled:
            !!guidanceArticleId &&
            !!guidanceHelpCenter?.id &&
            guidanceMode !== 'create',
    })
    if (!isOpen) {
        return null
    }

    if (
        (guidanceArticleId && isGuidanceArticleLoading) ||
        !guidanceHelpCenter
    ) {
        return <LegacyLoadingSpinner size="big" />
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
    }

    return (
        <KnowledgeEditorGuidanceProvider config={config}>
            <KnowledgeEditorGuidanceInner />
        </KnowledgeEditorGuidanceProvider>
    )
}
