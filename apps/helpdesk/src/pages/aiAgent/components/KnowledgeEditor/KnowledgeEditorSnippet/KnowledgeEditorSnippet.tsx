import { useCallback, useState } from 'react'

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
}: Props) => {
    const [isFullscreen, setIsFullscreen] = useState(false)

    const onToggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen)
    }, [isFullscreen])

    const { isPlaygroundOpen, onTest, onClosePlayground, sidePanelWidth } =
        usePlaygroundPanelInKnowledgeEditor(isFullscreen)

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
                        locale={snippetHelpCenter.default_locale}
                        onClose={onClose}
                        onClickPrevious={onClickPrevious}
                        onClickNext={onClickNext}
                        onUpdated={onUpdated}
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={onToggleFullscreen}
                        onTest={onTest}
                    />
                </div>
                {isPlaygroundOpen && (
                    <div className={css.playground}>
                        <PlaygroundPanel onClose={onClosePlayground} />
                    </div>
                )}
            </div>
        </SidePanel>
    )
}
