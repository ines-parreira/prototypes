import { useCallback, useRef, useState } from 'react'

import classNames from 'classnames'

import {
    LegacyLoadingSpinner as LoadingSpinner,
    SidePanel,
} from '@gorgias/axiom'

import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import { KnowledgeEditorGuidanceLoaderForCreate } from './create'
import { KnowledgeEditorGuidanceLoaderForEdit } from './edit'
import type { BaseProps } from './KnowledgeEditorGuidanceView'

import css from '../shared.less'

type Props = Omit<
    BaseProps,
    'isFullscreen' | 'onToggleFullscreen' | 'onTest'
> & {
    shopName: string
    shopType: string
    guidanceArticleId?: number
    guidanceTemplate?: GuidanceTemplate
    onDelete?: () => void
    onCreate?: () => void
    onUpdate?: () => void
    onCopy?: () => void
    isOpen: boolean
}

const KnowledgeEditorGuidanceHelpCenterLoader = ({
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
    isOpen,
}: Props) => {
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })

    const [isFullscreen, setIsFullscreen] = useState(false)

    const onToggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen)
    }, [isFullscreen])

    const closeHandlerRef = useRef<(() => void) | null>(null)

    const { isPlaygroundOpen, onTest, onClosePlayground, sidePanelWidth } =
        usePlaygroundPanelInKnowledgeEditor(isFullscreen)

    const isEditMode = guidanceArticleId && guidanceMode !== 'create'

    const renderContent = () => {
        if (!guidanceHelpCenter) {
            return <LoadingSpinner size="big" />
        }

        if (isEditMode) {
            return (
                <KnowledgeEditorGuidanceLoaderForEdit
                    shopName={shopName}
                    shopType={shopType}
                    guidanceArticleId={guidanceArticleId}
                    guidanceHelpCenterId={guidanceHelpCenter.id}
                    locale={guidanceHelpCenter.default_locale}
                    onClose={onClose}
                    onClickPrevious={onClickPrevious}
                    onClickNext={onClickNext}
                    onDeleteFn={onDelete}
                    onUpdateFn={onUpdate}
                    onCopyFn={onCopy}
                    guidanceMode={guidanceMode}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={onToggleFullscreen}
                    onTest={onTest}
                    closeHandlerRef={closeHandlerRef}
                />
            )
        }

        return (
            <KnowledgeEditorGuidanceLoaderForCreate
                shopName={shopName}
                shopType={shopType}
                guidanceTemplate={guidanceTemplate}
                guidanceHelpCenterId={guidanceHelpCenter.id}
                locale={guidanceHelpCenter.default_locale}
                onClose={onClose}
                onClickPrevious={onClickPrevious}
                onClickNext={onClickNext}
                onArticleCreated={() => {}}
                onCreateFn={onCreate}
                guidanceMode={guidanceMode}
                isFullscreen={isFullscreen}
                onToggleFullscreen={onToggleFullscreen}
                onTest={onTest}
                closeHandlerRef={closeHandlerRef}
            />
        )
    }

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    if (closeHandlerRef.current) {
                        closeHandlerRef.current()
                    } else {
                        onClose()
                    }
                }
            }}
            isDismissable
            withoutPadding
            width={sidePanelWidth}
        >
            <div className={css.splitView}>
                <div
                    className={classNames(css.editor, {
                        [css.loader]: !guidanceHelpCenter,
                    })}
                >
                    {renderContent()}
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

export const KnowledgeEditorGuidance = KnowledgeEditorGuidanceHelpCenterLoader
