import { useCallback, useEffect, useMemo, useState } from 'react'

import { Card } from '@gorgias/axiom'

import { EditorWithPlayground } from 'common/knowledge-editor/components'
import type { PlaygroundState } from 'common/knowledge-editor/types'
import { useGetHelpCenter } from 'models/helpCenter/queries'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'
import type { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'

import { KnowledgeEditorLoadingShell } from '../KnowledgeEditorLoadingShell'
import type { KnowledgeEditorSharedPanelState } from '../sharedPanel.types'
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
    onSharedPanelStateChange?: (state: KnowledgeEditorSharedPanelState) => void
    snippetHelpCenterId: number
}

export const KnowledgeEditorSnippet = ({
    snippetId,
    snippetType,
    onClose,
    onClickPrevious,
    onClickNext,
    onUpdated,
    isOpen,
    handleVisibilityUpdate,
    onSharedPanelStateChange,
    snippetHelpCenterId,
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

    const { data: snippetHelpCenter, isLoading: isSnippetHelpCenterLoading } =
        useGetHelpCenter(
            snippetHelpCenterId,
            {},
            {
                enabled: isOpen && !!snippetHelpCenterId,
            },
        )

    const onRequestClose = useCallback(() => {
        onClose()
    }, [onClose])

    useEffect(() => {
        if (!onSharedPanelStateChange || !snippetHelpCenter) {
            return
        }

        onSharedPanelStateChange({
            width: sidePanelWidth,
            onRequestClose,
        })
    }, [
        onSharedPanelStateChange,
        sidePanelWidth,
        onRequestClose,
        snippetHelpCenter,
    ])

    const playground = useMemo<PlaygroundState>(
        () => ({
            isOpen: isPlaygroundOpen,
            onTest,
            onClose: onClosePlayground,
            sidePanelWidth,
            shouldHideFullscreenButton,
        }),
        [
            isPlaygroundOpen,
            onTest,
            onClosePlayground,
            sidePanelWidth,
            shouldHideFullscreenButton,
        ],
    )

    if (!isOpen) {
        return null
    }

    if (isSnippetHelpCenterLoading) {
        return <KnowledgeEditorLoadingShell />
    }

    if (!snippetHelpCenter) {
        return null
    }

    return (
        <EditorWithPlayground playground={playground}>
            <Card elevation="mid" className={css.editor} padding={0}>
                <KnowledgeEditorSnippetLoader
                    snippetId={snippetId}
                    snippetType={snippetType}
                    helpCenterId={snippetHelpCenter?.id ?? 0}
                    shopIntegrationId={
                        snippetHelpCenter?.shop_integration_id ?? 0
                    }
                    locale={snippetHelpCenter?.default_locale ?? 'en-US'}
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
            </Card>
        </EditorWithPlayground>
    )
}
