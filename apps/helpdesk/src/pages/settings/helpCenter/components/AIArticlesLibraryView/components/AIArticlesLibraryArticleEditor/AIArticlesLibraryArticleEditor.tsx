import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'

import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { AILibraryArticleItem, LocaleCode } from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import Group from 'pages/common/components/layout/Group'
import {
    DRAWER_TRANSITION_DURATION_MS,
    EDITOR_MODAL_CONTAINER_ID,
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_TITLE_MAX_LENGTH,
} from 'pages/settings/helpCenter/constants'
import { useAbilityChecker } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { getLocaleSelectOptions } from 'pages/settings/helpCenter/utils/localeSelectOptions'
import { getCategories } from 'state/entities/helpCenter/categories'

import ArticleCategorySelect from '../../../articles/ArticleCategorySelect'
import { ArticleLanguageSelect } from '../../../articles/ArticleLanguageSelect'
import { CloseModal } from '../../../articles/CloseModal'
import HelpCenterEditModal from '../../../articles/HelpCenterEditModal'
import HelpCenterEditor from '../../../articles/HelpCenterEditor/HelpCenterEditor'
import { isOneOfParentsUnlisted } from '../../../HelpCenterCategoryEdit/utils'
import SelectVisibilityStatus from '../../../SelectVisibilityStatus/SelectVisibilityStatus'
import { onEditorSaveProps } from '../../hooks/useAILibraryActions'

import css from './AIArticlesLibraryArticleEditor.less'

type Props = {
    article?: AILibraryArticleItem
    locale: LocaleCode
    isLoading: boolean
    isEditModalOpen: boolean
    onEditorClose: () => void
    onEditorSave: ({
        article,
        title,
        content,
        saveAsDraft,
        categoryId,
        visibilityStatus,
    }: onEditorSaveProps) => void
}

const ArticleEditor: React.FC<Props> = ({
    article,
    locale,
    isLoading,
    isEditModalOpen,
    onEditorClose,
    onEditorSave,
}) => {
    const { isPassingRulesCheck } = useAbilityChecker()
    const canManageArticle = isPassingRulesCheck(({ can }) =>
        can('manage', 'ArticleEntity'),
    )
    const categories = useAppSelector(getCategories)
    const locales = useSupportedLocales()

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null,
    )
    const [visibilityStatus, setVisibilityStatus] = useState<
        'PUBLIC' | 'UNLISTED'
    >('PUBLIC')
    const [showNotification, setShowNotification] = useState(false)
    const [isParentUnlisted, setIsParentUnlisted] = useState(false)

    const localeOptions = useMemo(
        () =>
            getLocaleSelectOptions(locales, [HELP_CENTER_DEFAULT_LOCALE]).map(
                (option) => {
                    return {
                        ...option,
                        isComplete: false,
                        canBeDeleted: false,
                    }
                },
            ),
        [locales],
    )

    const [title, setTitle] = useState<string>()
    const [content, setContent] = useState<string>()
    const [count, setCount] = useState<number>()

    const [isDisabled, setIsDisabled] = useState<boolean>(true)
    const [isPristine, setIsPristine] = useState<boolean>(true)

    const [pendingDiscardChanges, setPendingDiscardChanges] = useState(false)
    const [pendingCloseEditor, setPendingCloseEditor] = useState(false)

    useEffect(() => {
        setTitle(article?.title)
        setContent(article?.html_content)
        setIsPristine(true)
        resetPendingStates()
    }, [article])

    useEffect(() => {
        setIsDisabled(!(title && content))
    }, [title, content])

    useEffect(() => {
        setIsParentUnlisted(
            isOneOfParentsUnlisted(categories, selectedCategoryId),
        )
    }, [selectedCategoryId, categories])

    useEffect(() => {
        if (isEditModalOpen) {
            setIsPristine(true)
        }
    }, [isEditModalOpen])

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
        setContent(article?.html_content)
        onEditorClose()
    }

    return (
        <HelpCenterEditModal
            isLoading={isLoading}
            portalRootId="app-root"
            onBackdropClick={handleEditorClose}
            transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
        >
            {article && (
                <div className={css.modalForm} id={EDITOR_MODAL_CONTAINER_ID}>
                    <header className={css.header}>
                        <input
                            type="text"
                            data-testid="article-title-input"
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
                    </header>
                    <Tooltip
                        placement="bottom-end"
                        target="close-edit-mode-button"
                        boundariesElement="body"
                    >
                        Close edit mode
                    </Tooltip>
                    <div className={css.dropdowns}>
                        <div>
                            <ArticleCategorySelect
                                locale={HELP_CENTER_DEFAULT_LOCALE}
                                categoryId={selectedCategoryId}
                                onChange={(categoryId) => {
                                    setSelectedCategoryId(categoryId)
                                }}
                                isDisabled={!canManageArticle}
                            />
                        </div>
                        <div>
                            <SelectVisibilityStatus
                                onChange={(status) => {
                                    setVisibilityStatus(status)
                                }}
                                status={visibilityStatus}
                                showNotification={showNotification}
                                setShowNotification={setShowNotification}
                                isParentUnlisted={isParentUnlisted}
                                type="article"
                                isDisabled={!canManageArticle}
                            />
                        </div>
                        <div>
                            <div id="article-language-select">
                                <ArticleLanguageSelect
                                    isDisabled={true}
                                    selected={HELP_CENTER_DEFAULT_LOCALE}
                                    list={localeOptions}
                                    onSelect={() => ({})}
                                    onActionClick={() => ({})}
                                    className={css.inlineLanguageSelect}
                                />
                            </div>
                            <Tooltip
                                target="article-language-select"
                                placement="top"
                            >
                                You can add this article in another language
                                after publishing it in English first.
                            </Tooltip>
                        </div>
                    </div>
                    <HelpCenterEditor
                        className={css.editor}
                        locale={locale}
                        value={content}
                        onChange={handleContentChange}
                    />
                    <footer className={css.footer}>
                        <div className={css.actions}>
                            <UncontrolledDropdown id="article-save-button-wrapper">
                                <Group>
                                    <Button
                                        id="save-changes-button"
                                        data-testid="save-changes-button"
                                        isDisabled={
                                            !canManageArticle || isDisabled
                                        }
                                        onClick={() =>
                                            onEditorSave({
                                                article,
                                                title: title!,
                                                content: content!,
                                                saveAsDraft: false,
                                                categoryId: selectedCategoryId!,
                                                visibilityStatus,
                                            })
                                        }
                                    >
                                        Save &amp; Publish
                                    </Button>
                                    {canManageArticle && !isDisabled && (
                                        <DropdownToggle tag="span">
                                            <IconButton>
                                                arrow_drop_down
                                            </IconButton>
                                        </DropdownToggle>
                                    )}
                                </Group>
                                <DropdownMenu right style={{ width: '100%' }}>
                                    <DropdownItem
                                        onClick={() =>
                                            onEditorSave({
                                                article,
                                                title: title!,
                                                content: content!,
                                                saveAsDraft: true,
                                                categoryId: selectedCategoryId!,
                                                visibilityStatus,
                                            })
                                        }
                                    >
                                        Save Changes
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={() =>
                                            onEditorSave({
                                                article,
                                                title: title!,
                                                content: content!,
                                                saveAsDraft: false,
                                                categoryId: selectedCategoryId!,
                                                visibilityStatus,
                                            })
                                        }
                                    >
                                        Save &amp; Publish
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
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
                                saveText="Save as draft"
                                discardText="Don't save"
                                editText="Back to editing"
                                onDiscard={onConfirmDiscardChanges}
                                onContinueEditing={resetPendingStates}
                                onSave={() =>
                                    onEditorSave({
                                        article,
                                        title: title!,
                                        content: content!,
                                        saveAsDraft: true,
                                        categoryId: selectedCategoryId!,
                                        visibilityStatus,
                                    })
                                }
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
