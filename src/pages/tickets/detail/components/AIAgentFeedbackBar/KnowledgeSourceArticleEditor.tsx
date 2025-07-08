import { useCallback, useEffect, useMemo, useRef } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import {
    Article,
    ArticleTranslationWithRating,
    CreateArticleTranslationDto,
    LocaleCode,
} from 'models/helpCenter/types'
import {
    ActionType,
    OptionItem,
} from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect/ArticleLanguageSelect'
import HelpCenterArticleModalAdvancedViewContent from 'pages/settings/helpCenter/components/articles/HelpCenterEditArticleModalContent/HelpCenterArticleModalAdvancedViewContent'
import HelpCenterArticleModalBasicViewContent from 'pages/settings/helpCenter/components/articles/HelpCenterEditArticleModalContent/HelpCenterArticleModalBasicViewContent'
import { HelpCenterArticleModalView } from 'pages/settings/helpCenter/components/articles/HelpCenterEditArticleModalContent/types'
import { HelpCenterEditModal } from 'pages/settings/helpCenter/components/articles/HelpCenterEditModal'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_DEFAULT_LAYOUT,
    MODALS,
} from 'pages/settings/helpCenter/constants'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { getArticleMode } from 'pages/settings/helpCenter/types/articleMode'
import {
    copyArticleLinkToClipboard,
    getNewArticleTranslation,
    isExistingArticle,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { useArticleTranslations } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useArticleTranslations'
import { useArticleValidation } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useArticleValidation'
import { useFeedbackArticleActions } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackArticleActions'
import { changeViewLanguage } from 'state/ui/helpCenter'
import {
    getCounters,
    getIsConsideredMissingKnowledge,
    getLastProcessedArticleId,
    getPendingClose,
    resetState,
    setCounters,
    setIsConsideredMissingKnowledge,
    setLastProcessedArticleId,
    setPendingClose,
    setPendingDeleteLocaleOptionItem,
} from 'state/ui/knowledgeSourceArticleEditor/knowledgeSourceArticleEditorSlice'

import { AddMissingKnowledgeCheckbox } from './AddMissingKnowledgeCheckbox'
import { HelpCenterArticleDeleteModal } from './HelpCenterArticleDeleteModal'
import { HelpCenterArticleDiscardModal } from './HelpCenterArticleDiscardModal'
import {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgePendingCloseType,
    SuggestedResourceValue,
} from './types'

import css from './KnowledgeSourceArticleEditor.less'

type KnowledgeSourceArticleEditorProps = {
    article: Article | null
    isCreateMode: boolean
    onClose: () => void
    onSubmitNewMissingKnowledge: (resource: SuggestedResourceValue) => void
    onSaveClick: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        isNew: boolean,
    ) => void
}

const UNINITIALIZED_ARTICLE_ID = -1

const KnowledgeSourceArticleEditor = ({
    article,
    isCreateMode,
    onClose,
    onSubmitNewMissingKnowledge,
    onSaveClick,
}: KnowledgeSourceArticleEditorProps) => {
    const dispatch = useAppDispatch()
    const helpCenter = useCurrentHelpCenter()
    const nextActionRef = useRef<(() => void) | (() => Promise<void>) | null>(
        null,
    )

    const {
        selectedCategoryId,
        setSelectedCategoryId,
        selectedArticleLanguage,
        setSelectedArticleLanguage,
        selectedArticle,
        setSelectedArticle,
        isEditorCodeViewActive,
        editModal,
        selectedTemplateKey,
        setSelectedTemplateKey,
    } = useEditionManager()

    const {
        selectedTranslation,
        getTranslationForLocale,
        isFetchingArticleTranslations,
    } = useArticleTranslations(
        selectedArticle,
        selectedCategoryId,
        selectedArticleLanguage,
    )

    const pendingClose = useAppSelector(getPendingClose)
    const counters = useAppSelector(getCounters)
    const lastProcessedArticleId = useAppSelector(getLastProcessedArticleId)
    const isConsideredMissingKnowledge = useAppSelector(
        getIsConsideredMissingKnowledge,
    )

    const articleModal = useModalManager(MODALS.ARTICLE, { autoDestroy: false })

    const closeModal = useCallback(() => {
        onClose()

        // TODO: this is here to be compatible with old HC view, in our use-case we don't work with templates, keeping for now to make refactoring easier
        // close modal to reset its parameters (category_id)
        setSelectedTemplateKey(null)
        dispatch(changeViewLanguage(helpCenter.default_locale))
        setSelectedArticleLanguage(helpCenter.default_locale)
        dispatch(resetState())
        articleModal.closeModal()
    }, [
        onClose,
        dispatch,
        helpCenter.default_locale,
        setSelectedArticleLanguage,
        setSelectedTemplateKey,
        articleModal,
    ])

    const shouldAddToMissingKnowledge = useMemo(() => {
        return isCreateMode && isConsideredMissingKnowledge
    }, [isCreateMode, isConsideredMissingKnowledge])

    const onArticleCreateOrUpdate = useCallback(
        (article: Article) => {
            setSelectedArticle(article)
            setSelectedArticleLanguage(article.translation.locale)

            if (shouldAddToMissingKnowledge) {
                onSubmitNewMissingKnowledge({
                    resourceId: article.id.toString(),
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceLocale: article.translation.locale,
                    resourceSetId: helpCenter.id.toString(),
                })
            }
        },
        [
            setSelectedArticle,
            setSelectedArticleLanguage,
            helpCenter.id,
            onSubmitNewMissingKnowledge,
            shouldAddToMissingKnowledge,
        ],
    )

    const onArticleCreate = useCallback(
        (article: Article) => {
            onArticleCreateOrUpdate(article)
            onSaveClick(
                article.id.toString(),
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                true,
            )
        },
        [onSaveClick, onArticleCreateOrUpdate],
    )

    const onArticleUpdate = useCallback(
        (article: Article) => {
            onArticleCreateOrUpdate(article)
            onSaveClick(
                article.id.toString(),
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                false,
            )
        },
        [onSaveClick, onArticleCreateOrUpdate],
    )

    const onArticleDelete = useCallback(() => {
        setSelectedArticle(null)
        closeModal()
    }, [setSelectedArticle, closeModal])

    const onArticleTranslationDelete = useCallback(
        (localeCode: LocaleCode) => {
            dispatch(changeViewLanguage(helpCenter.default_locale))
            setSelectedArticleLanguage(helpCenter.default_locale)

            // to save an additional API call, we update the article's available_locales after the specific translation is deleted
            setSelectedArticle((prevSelectedArticle) =>
                prevSelectedArticle
                    ? {
                          ...prevSelectedArticle,
                          available_locales:
                              'available_locales' in prevSelectedArticle
                                  ? prevSelectedArticle.available_locales.filter(
                                        (locale) => locale !== localeCode,
                                    )
                                  : [],
                      }
                    : prevSelectedArticle,
            )
        },
        [
            dispatch,
            helpCenter.default_locale,
            setSelectedArticleLanguage,
            setSelectedArticle,
        ],
    )

    const {
        isLoading,
        createArticle,
        updateArticle,
        deleteArticle,
        deleteArticleTranslation,
    } = useFeedbackArticleActions(
        selectedTemplateKey,
        onArticleCreate,
        onArticleUpdate,
        onArticleDelete,
        onArticleTranslationDelete,
    )

    const { canSaveArticle, articleModified, requiredFieldsArticle } =
        useArticleValidation({
            selectedArticle,
            selectedTranslation,
            selectedCategoryId,
            isLoading,
            isEditorCodeViewActive,
        })

    const hasDefaultLayout = helpCenter.layout === HELP_CENTER_DEFAULT_LAYOUT
    const onArticleChange = (
        { content }: { content: string },
        charCount?: number,
    ) => {
        setSelectedArticle((prevSelectedArticle) =>
            prevSelectedArticle?.translation
                ? {
                      ...prevSelectedArticle,
                      translation: {
                          ...prevSelectedArticle.translation,
                          content,
                      },
                  }
                : prevSelectedArticle,
        )

        if (typeof charCount === 'number') {
            dispatch(setCounters({ charCount }))
        }
    }

    const createNewArticle = useCallback(() => {
        const categoryFromModalParams =
            articleModal.getParams()?.categoryId ?? null

        setSelectedArticle({
            translation: getNewArticleTranslation(
                selectedArticleLanguage,
                categoryFromModalParams,
            ),
        })

        setSelectedCategoryId(categoryFromModalParams)
    }, [
        selectedArticleLanguage,
        setSelectedArticle,
        setSelectedCategoryId,
        articleModal,
    ])

    useEffect(() => {
        const articleId = article && 'id' in article ? article.id : null
        if (!isCreateMode && articleId !== lastProcessedArticleId) {
            dispatch(setLastProcessedArticleId(articleId))
            setSelectedArticle(article)
        }
        if (
            isCreateMode &&
            articleId === null &&
            lastProcessedArticleId !== UNINITIALIZED_ARTICLE_ID
        ) {
            dispatch(setLastProcessedArticleId(UNINITIALIZED_ARTICLE_ID))
            createNewArticle()
        }
    }, [
        article,
        setSelectedArticle,
        isCreateMode,
        createNewArticle,
        lastProcessedArticleId,
        dispatch,
    ])

    useEffect(() => {
        if (!selectedTranslation || !selectedArticle) {
            return
        }

        const isTranslationChanged =
            selectedArticle.translation !== selectedTranslation
        const isContentChanged =
            selectedTranslation.content !== selectedArticle.translation.content

        if (isTranslationChanged && isContentChanged) {
            setSelectedArticle({
                ...selectedArticle,
                translation: selectedTranslation,
            })
        }

        if (selectedArticle.translation.category_id !== undefined) {
            setSelectedCategoryId(selectedArticle.translation.category_id)
        }
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selectedTranslation,
        setSelectedArticle,
        setSelectedCategoryId,
    ])

    const articleMode = useMemo(() => {
        return getArticleMode(selectedArticle, articleModified, {
            createArticle,
            deleteArticle: () => deleteArticle(selectedArticle),
            updateArticle,
        })
    }, [
        selectedArticle,
        articleModified,
        createArticle,
        deleteArticle,
        updateArticle,
    ])

    const onEditorReady = useCallback(
        (content: string) => {
            // Set the initial translation content and the selected article translation
            // content once the Froala editor is done loading and pre-formatting the content
            if (selectedArticle) {
                setSelectedArticle((prev) =>
                    prev
                        ? {
                              ...prev,
                              translation: {
                                  ...prev.translation,
                                  content,
                              },
                          }
                        : prev,
                )
            }
        },
        [selectedArticle, setSelectedArticle],
    )

    const onArticleLanguageSelect = (
        localeCode: LocaleCode,
        translation: ArticleTranslationWithRating | CreateArticleTranslationDto,
    ) => {
        if (!selectedArticle) {
            return
        }
        setSelectedArticle((prevSelectedArticle) =>
            prevSelectedArticle
                ? { ...prevSelectedArticle, translation }
                : prevSelectedArticle,
        )
        setSelectedArticleLanguage(localeCode)
    }

    const handleTranslationChange = async (localeCode: LocaleCode) => {
        const translation = getTranslationForLocale(localeCode)
        onArticleLanguageSelect(localeCode, translation)
    }

    const onArticleLanguageSelectAttempt = (localeCode: LocaleCode) => {
        if (canSaveArticle || isEditorCodeViewActive) {
            dispatch(setPendingClose(KnowledgePendingCloseType.Article))
            nextActionRef.current = () =>
                void handleTranslationChange(localeCode)
        } else {
            const translation = getTranslationForLocale(localeCode)
            if (translation) onArticleLanguageSelect(localeCode, translation)
        }
    }

    const onArticleLanguageSelectActionClick = (
        action: ActionType,
        option: OptionItem,
    ) => {
        if (action === 'delete') {
            dispatch(setPendingDeleteLocaleOptionItem(option))
        } else {
            onArticleLanguageSelectAttempt(option.value)
        }
    }

    const onDiscardChangesAttempt = () => {
        if (canSaveArticle || isEditorCodeViewActive) {
            dispatch(setPendingClose(KnowledgePendingCloseType.Discard))
            nextActionRef.current = closeModal
        } else {
            closeModal()
        }
    }

    const onCopyLinkToClipboard = useCallback(
        (article: Article, isUnlisted: boolean) => {
            copyArticleLinkToClipboard({
                article,
                isUnlisted,
                helpCenter,
                hasDefaultLayout,
                dispatch,
            })
        },
        [helpCenter, hasDefaultLayout, dispatch],
    )

    const autoFocus = editModal.isOpened && !isExistingArticle(selectedArticle)
    const isEditorInBasicView =
        editModal.view === HelpCenterArticleModalView.BASIC

    const footerContent = useMemo(() => {
        if (isCreateMode) {
            return (
                <AddMissingKnowledgeCheckbox
                    isChecked={isConsideredMissingKnowledge}
                    onChange={(checked) =>
                        dispatch(setIsConsideredMissingKnowledge(checked))
                    }
                />
            )
        }
        // empty element to prevent rating from being displayed
        return <></>
    }, [isCreateMode, isConsideredMissingKnowledge, dispatch])

    const modalStyle = {
        width: '612px',
        maxWidth: '612px',
        right: '-612px',
        ...(editModal.isOpened && {
            transform: 'translateX(-612px)',
        }),
    }

    return (
        <>
            <div className={css.root}>
                <HelpCenterEditModal
                    isLoading={isFetchingArticleTranslations}
                    portalRootId="root"
                    onBackdropClick={onDiscardChangesAttempt}
                    transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
                    modalStyle={modalStyle}
                >
                    {isEditorInBasicView && (
                        <HelpCenterArticleModalBasicViewContent
                            canSaveArticle={canSaveArticle}
                            counters={counters}
                            onArticleChange={onArticleChange}
                            onEditorReady={onEditorReady}
                            onArticleLanguageSelect={
                                onArticleLanguageSelectAttempt
                            }
                            onArticleLanguageSelectActionClick={
                                onArticleLanguageSelectActionClick
                            }
                            onArticleModalClose={onClose}
                            onChangesDiscard={onDiscardChangesAttempt}
                            onCopyLinkToClipboard={onCopyLinkToClipboard}
                            requiredFieldsArticle={requiredFieldsArticle}
                            autoFocus={autoFocus}
                            articleMode={articleMode}
                            customFooterContent={footerContent}
                        />
                    )}
                    {!isEditorInBasicView && (
                        <HelpCenterArticleModalAdvancedViewContent
                            onArticleLanguageSelect={
                                onArticleLanguageSelectAttempt
                            }
                            onArticleModalClose={onDiscardChangesAttempt}
                            onArticleLanguageSelectActionClick={
                                onArticleLanguageSelectActionClick
                            }
                            canSaveArticle={canSaveArticle}
                            requiredFieldsArticle={requiredFieldsArticle}
                            onChangesDiscard={onDiscardChangesAttempt}
                            onCopyLinkToClipboard={onCopyLinkToClipboard}
                            autoFocus={autoFocus}
                            articleMode={articleMode}
                            customFooterContent={footerContent}
                        />
                    )}
                </HelpCenterEditModal>
            </div>

            {isExistingArticle(selectedArticle) && (
                <HelpCenterArticleDeleteModal
                    selectedArticleId={selectedArticle.id}
                    onDeleteConfirm={deleteArticleTranslation}
                />
            )}

            {pendingClose && (
                <HelpCenterArticleDiscardModal
                    isOpen={canSaveArticle || isEditorCodeViewActive}
                    createArticle={createArticle}
                    updateArticle={updateArticle}
                    onAfterClose={() => {
                        if (nextActionRef.current) {
                            nextActionRef.current()
                            nextActionRef.current = null
                        }
                    }}
                />
            )}
        </>
    )
}

export default KnowledgeSourceArticleEditor
