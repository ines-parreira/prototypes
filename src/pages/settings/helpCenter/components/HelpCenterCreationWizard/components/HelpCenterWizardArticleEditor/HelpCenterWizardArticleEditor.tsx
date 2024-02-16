import React, {ChangeEvent, useEffect, useState} from 'react'

import {
    DRAWER_TRANSITION_DURATION_MS,
    EDITOR_MODAL_CONTAINER_ID,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from 'pages/settings/helpCenter/constants'
import Button from 'pages/common/components/button/Button'
import Tooltip from 'pages/common/components/Tooltip'
import IconButton from 'pages/common/components/button/IconButton'
import {HelpCenterArticleItem, LocaleCode} from 'models/helpCenter/types'
import {logEvent, SegmentEvent} from 'common/segment'
import HelpCenterEditModal from '../../../articles/HelpCenterEditModal'

import HelpCenterEditor from '../../../articles/HelpCenterEditor/HelpCenterEditor'
import {DiscardChangesModal} from '../../../articles/DiscardChangesModal'
import {CloseModal} from '../../../articles/CloseModal'
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
        setPendingCloseEditor(false)
    }, [article])

    useEffect(() => {
        setIsDisabled(!(title && content))
    }, [title, content])

    useEffect(() => {
        if (article) {
            logEvent(SegmentEvent.WizardArticleEditViewed, {
                type: 'template',
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

    const onConfirmDiscardChanges = () => {
        setPendingDiscardChanges(false)
        setPendingCloseEditor(false)
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

                        {pendingDiscardChanges && (
                            <DiscardChangesModal
                                title="Quit without saving?"
                                onDiscard={onConfirmDiscardChanges}
                                onContinueEditing={() =>
                                    setPendingDiscardChanges(false)
                                }
                            >
                                By discarding changes you will lose all progress
                                you made editing. Are you sure you want to
                                proceed?
                            </DiscardChangesModal>
                        )}

                        {pendingCloseEditor && (
                            <CloseModal
                                isOpen={!!pendingCloseEditor}
                                title="Save changes?"
                                saveText="Save changes"
                                discardText="Discard changes"
                                editText="Back to editing"
                                onDiscard={onConfirmDiscardChanges}
                                onContinueEditing={() =>
                                    setPendingCloseEditor(false)
                                }
                                onSave={() => onEditorSave(title!, content!)}
                            >
                                Your changes to this page will be lost if you
                                don't save them.
                            </CloseModal>
                        )}
                    </footer>
                </div>
            )}
        </HelpCenterEditModal>
    )
}

export default ArticleEditor
