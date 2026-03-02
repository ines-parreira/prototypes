import { useCallback, useEffect, useState } from 'react'

import cn from 'classnames'

import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'
import type { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
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
    onSharedPanelStateChange,
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

    const {
        helpCenter: snippetHelpCenter,
        isLoading: isSnippetHelpCenterLoading,
    } = useAiAgentHelpCenterState({
        shopName,
        helpCenterType: 'snippet',
        enabled: isOpen,
    })

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
        <div className={css.splitView}>
            <div className={css.editor}>
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
    )
}
