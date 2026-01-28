import { useCallback, useState } from 'react'

import cn from 'classnames'

import { SidePanel } from '@gorgias/axiom'

import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'
import type { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import { KnowledgeEditorSnippetLoader } from './KnowledgeEditorSnippetLoader'

import css from './KnowledgeEditorSnippet.less'

type Props = {
    shopName: string
    snippetId: number
    snippetType: SnippetType
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    onUpdated?: () => void
    isOpen: boolean
    handleVisibilityUpdate?: (visibility: string) => void
}

export const KnowledgeEditorSnippet = ({
    shopName,
    snippetId,
    snippetType,
    onClose,
    onClickPrevious,
    onClickNext,
    onUpdated,
    isOpen,
    handleVisibilityUpdate,
}: Props) => {
    const [isFullscreen, setIsFullscreen] = useState(false)

    const onToggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen)
    }, [isFullscreen])

    const {
        isPlaygroundOpen,
        onTest,
        onClosePlayground,
        sidePanelWidth,
        shouldHideFullscreenButton,
    } = usePlaygroundPanelInKnowledgeEditor(isFullscreen)

    const snippetHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'snippet',
    })

    if (!snippetHelpCenter) {
        return null
    }

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose()
                }
            }}
            isDismissable
            withoutPadding
            width={sidePanelWidth}
        >
            <div className={css.splitView}>
                <div className={css.editor}>
                    <KnowledgeEditorSnippetLoader
                        snippetId={snippetId}
                        snippetType={snippetType}
                        helpCenterId={snippetHelpCenter.id}
                        shopIntegrationId={
                            snippetHelpCenter.shop_integration_id ?? 0
                        }
                        locale={snippetHelpCenter.default_locale}
                        onClose={onClose}
                        onClickPrevious={onClickPrevious}
                        onClickNext={onClickNext}
                        onUpdated={onUpdated}
                        isFullscreen={isFullscreen}
                        isPlaygroundOpen={isPlaygroundOpen}
                        onToggleFullscreen={onToggleFullscreen}
                        onTest={onTest}
                        handleVisibilityUpdate={handleVisibilityUpdate}
                        shouldHideFullscreenButton={shouldHideFullscreenButton}
                    />
                </div>
                <div
                    className={cn(
                        css.playground,
                        isPlaygroundOpen
                            ? css['playground-open']
                            : css['playground-closed'],
                    )}
                >
                    <PlaygroundPanel onClose={onClosePlayground} />
                </div>
            </div>
        </SidePanel>
    )
}
