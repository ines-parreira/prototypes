import { useCallback, useEffect } from 'react'

import { DrillDownModal } from '../../../../../domains/reporting/pages/common/drill-down/DrillDownModal'
import { KnowledgeEditorSidePanelHelpCenterArticle } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelHelpCenterArticle'
import { KnowledgeEditorTopBar } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import { ArticleToolbarControls } from './ArticleToolbarControls'
import { ArticleVersionBanner } from './ArticleVersionBanner'
import { useArticleContext } from './context'
import { useArticleAutoSave } from './hooks'
import { KnowledgeEditorHelpCenterArticleEditView } from './KnowledgeEditorHelpCenterArticleEditView'
import { KnowledgeEditorHelpCenterArticleReadView } from './KnowledgeEditorHelpCenterArticleReadView'
import {
    ArticleDeleteModal,
    ArticleDiscardDraftModal,
    ArticleTranslationDeleteModal,
    ArticleUnsavedChangesModal,
} from './modals'

import css from './KnowledgeEditorHelpCenterArticle.less'

type Props = {
    closeHandlerRef: React.MutableRefObject<(() => void) | null>
}

export const ArticleEditorContent = ({ closeHandlerRef }: Props) => {
    const { state, dispatch, config, hasPendingContentChanges } =
        useArticleContext()

    const { onClickPrevious, onClickNext, onClose } = config

    const { onChangeField } = useArticleAutoSave()

    const isDisabled = state.isUpdating || state.isAutoSaving

    const onClickCancel = useCallback(() => {
        if (isDisabled) return

        if (hasPendingContentChanges) {
            dispatch({ type: 'SET_MODAL', payload: 'unsaved' })
        } else {
            onClose()
        }
    }, [hasPendingContentChanges, dispatch, onClose, isDisabled])

    useEffect(() => {
        closeHandlerRef.current = onClickCancel
    }, [closeHandlerRef, onClickCancel])

    return (
        <div className={css.container}>
            <KnowledgeEditorTopBar
                onClickPrevious={
                    state.articleMode !== 'edit' ? onClickPrevious : undefined
                }
                onClickNext={
                    state.articleMode !== 'edit' ? onClickNext : undefined
                }
                title={
                    state.articleMode === 'read'
                        ? 'Help Center article'
                        : state.title
                }
                onChangeTitle={
                    state.articleMode === 'read'
                        ? undefined
                        : (title) => onChangeField('title', title)
                }
                isFullscreen={state.isFullscreen}
                onToggleFullscreen={() =>
                    dispatch({ type: 'TOGGLE_FULLSCREEN' })
                }
                onClose={onClickCancel}
                isDetailsView={state.isDetailsView}
                onToggleDetailsView={() =>
                    dispatch({ type: 'TOGGLE_DETAILS_VIEW' })
                }
                disabled={isDisabled}
                isSaving={state.isAutoSaving}
                lastUpdatedDatetime={
                    state.isAutoSaving
                        ? undefined
                        : state.article?.translation.updated_datetime
                          ? new Date(state.article.translation.updated_datetime)
                          : undefined
                }
            >
                <ArticleToolbarControls />
            </KnowledgeEditorTopBar>

            <div className={css.contentContainer}>
                <div className={css.editorContainer}>
                    <ArticleVersionBanner />

                    {state.articleMode === 'read' ? (
                        <KnowledgeEditorHelpCenterArticleReadView
                            content={state.content}
                            title={state.title}
                        />
                    ) : (
                        <KnowledgeEditorHelpCenterArticleEditView
                            locale={state.currentLocale}
                            articleId={state.article?.id}
                            content={state.content}
                            onChangeContent={(content) =>
                                onChangeField('content', content)
                            }
                        />
                    )}
                </div>

                {state.isDetailsView && (
                    <KnowledgeEditorSidePanelHelpCenterArticle />
                )}
            </div>

            <ArticleUnsavedChangesModal />
            <ArticleDiscardDraftModal />
            <ArticleDeleteModal />
            <ArticleTranslationDeleteModal />
            <DrillDownModal isLegacy={false} />
        </div>
    )
}
