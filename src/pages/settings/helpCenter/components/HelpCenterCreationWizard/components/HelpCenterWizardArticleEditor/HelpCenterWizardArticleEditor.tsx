import {Tooltip} from '@gorgias/ui-kit'
import React, {ChangeEvent, useEffect, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {HelpCenterArticleItem, LocaleCode} from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import {
    DRAWER_TRANSITION_DURATION_MS,
    EDITOR_MODAL_CONTAINER_ID,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from 'pages/settings/helpCenter/constants'

import {CloseModal} from '../../../articles/CloseModal'
import HelpCenterEditModal from '../../../articles/HelpCenterEditModal'

import HelpCenterEditor from '../../../articles/HelpCenterEditor/HelpCenterEditor'
import css from './HelpCenterWizardArticleEditor.less'

type Props = {
    article: HelpCenterArticleItem | null
    locale: LocaleCode
    isLoading: boolean
    onEditorClose: () => void
    onEditorReady: (content: string) => void
    onEditorSave: (title: string, content: string) => void
}

const ArticleEditor: React.FC<Props> = ({
    article,
    locale,
    isLoading,
    onEditorClose,
    onEditorReady,
    onEditorSave,
}) => {
    const [title, setTitle] = useState<string>()
    const [content, setContent] = useState<string>()
    const [count, setCount] = useState<number>()

    const [isDisabled, setIsDisabled] = useState<boolean>(true)
    const [isPristine, setIsPristine] = useState<boolean>(true)

    const [pendingDiscardChanges, setPendingDiscardChanges] = useState(false)
    const [pendingCloseEditor, setPendingCloseEditor] = useState(false)

    useEffect(() => {
        setTitle(article?.title)
        setContent(article?.content)
        setIsPristine(true)
        resetPendingStates()
    }, [article])

    useEffect(() => {
        setIsDisabled(!(title && content))
    }, [title, content])

    useEffect(() => {
        if (article) {
            logEvent(SegmentEvent.WizardArticleEditViewed, {
                type: article.type,
            })
        }
    }, [article])

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
        setIsPristine(false)
    }

    const handleContentChange = (newContent: string, charCount?: number) => {
        setContent(newContent)
        setCount(charCount)
        setIsPristine(false)
    }

    const handleDiscardChanges = () => {
        isPristine ? onEditorClose() : setPendingDiscardChanges(true)
    }

    const handleEditorClose = () => {
        isPristine ? onEditorClose() : setPendingCloseEditor(true)
    }

    const resetPendingStates = () => {
        setPendingDiscardChanges(false)
        setPendingCloseEditor(false)
    }

    const onConfirmDiscardChanges = () => {
        resetPendingStates()
        onEditorClose()
    }

    return (
        <HelpCenterEditModal
            isLoading={isLoading}
            portalRootId="app-root"
            onBackdropClick={handleEditorClose}
            transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
            containerZIndices={[100, -1]}
        >
            {article && (
                <div className={css.modalForm} id={EDITOR_MODAL_CONTAINER_ID}>
                    <header className={css.header}>
                        <input
                            type="text"
                            value={title}
                            placeholder="Title"
                            onChange={handleTitleChange}
                            className={css.titleInput}
                            maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                        />
                        <IconButton
                            onClick={handleEditorClose}
                            fillStyle="ghost"
                            id="close-edit-mode-button"
                            intent="secondary"
                            size="medium"
                            aria-label="close edit modal"
                        >
                            keyboard_tab
                        </IconButton>
                        <Tooltip
                            placement="bottom-end"
                            target="close-edit-mode-button"
                            boundariesElement="body"
                        >
                            Close edit mode
                        </Tooltip>
                    </header>
                    <HelpCenterEditor
                        className={css.editor}
                        locale={locale}
                        value={content}
                        onChange={handleContentChange}
                        onEditorReady={onEditorReady}
                    />
                    <footer className={css.footer}>
                        <div className={css.actions}>
                            <Button
                                id="save-changes-button"
                                isDisabled={isDisabled}
                                onClick={() => onEditorSave(title!, content!)}
                            >
                                Save changes
                            </Button>
                            {isDisabled && (
                                <Tooltip
                                    target="save-changes-button"
                                    placement="bottom-start"
                                >
                                    You need to add title and content
                                </Tooltip>
                            )}
                            <Button
                                intent="secondary"
                                onClick={handleDiscardChanges}
                            >
                                Discard changes
                            </Button>
                        </div>
                        <div className={css.counter}>Characters: {count}</div>

                        {(pendingCloseEditor || pendingDiscardChanges) && (
                            <CloseModal
                                isOpen={
                                    pendingCloseEditor || pendingDiscardChanges
                                }
                                title={
                                    pendingCloseEditor
                                        ? 'Unsaved changes'
                                        : 'Quit without saving?'
                                }
                                saveText="Save"
                                discardText="Don't save"
                                editText="Back to editing"
                                onDiscard={onConfirmDiscardChanges}
                                onContinueEditing={resetPendingStates}
                                onSave={() => onEditorSave(title!, content!)}
                            >
                                {pendingCloseEditor
                                    ? "Do you want to save the changes made to this article? All changes will be lost if you don't save them."
                                    : 'By discarding changes you will lose all progress you made editing. Are you sure you want to proceed?'}
                            </CloseModal>
                        )}
                    </footer>
                </div>
            )}
        </HelpCenterEditModal>
    )
}

export default ArticleEditor
