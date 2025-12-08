import { useCallback, useState } from 'react'

import { SidePanel } from '@gorgias/axiom'

import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import type { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'

import { KnowledgeEditorSnippetLoader } from './KnowledgeEditorSnippetLoader'

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
            withoutPadding
            width={isFullscreen ? '100vw' : '66vw'}
        >
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
            />
        </SidePanel>
    )
}
