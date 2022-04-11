import React, {useEffect, useMemo, useRef, useState} from 'react'
import axios from 'axios'
import copy from 'copy-to-clipboard'
import _isEqual from 'lodash/isEqual'

import Button from 'pages/common/components/button/Button'

import {useLimitations} from 'hooks/helpCenter/useLimitations'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {Event, useModalManager} from 'hooks/useModalManager'
import {
    Article,
    ArticleTranslationWithRating,
    CreateArticleDto,
    CreateArticleTranslationDto,
    LocaleCode,
} from 'models/helpCenter/types'
import {resetArticles} from 'state/entities/helpCenter/articles'
import {resetCategories} from 'state/entities/helpCenter/categories'
import {getViewLanguage} from 'state/ui/helpCenter'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_DEFAULT_LOCALE,
    MODALS,
} from '../constants'
import {useArticlesActions} from '../hooks/useArticlesActions'
import {useHelpCenterActions} from '../hooks/useHelpCenterActions'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import {
    articleRequiredFields,
    getArticleUrl,
    getHelpCenterDomain,
    getNewArticleTranslation,
    isExistingArticle,
} from '../utils/helpCenter.utils'
import {ArticleMode, getArticleMode} from '../types/articleMode'

import {useEditionManager} from '../providers/EditionManagerContext'

import {ActionType, OptionItem} from './articles/ArticleLanguageSelect'
import {CloseModal} from './articles/CloseModal'
import {DiscardChangesModal} from './articles/DiscardChangesModal'
import HelpCenterEditModal from './articles/HelpCenterEditModal'
import {ArticlesTable} from './ArticlesTable'
import {CategoryDrawer} from './CategoryDrawer'
import {CategoriesViews} from './CategoriesView'
import {ConfirmationModal} from './ConfirmationModal'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import MaxArticleBanner from './Paywalls/MaxArticleBanner'

import css from './HelpCenterArticlesView.less'
import HelpCenterArticleModalBasicViewContent from './articles/HelpCenterEditArticleModalContent/HelpCenterArticleModalBasicViewContent'
import HelpCenterArticleModalAdvancedViewContent from './articles/HelpCenterEditArticleModalContent/HelpCenterArticleModalAdvancedViewContent'
import {HelpCenterArticleModalView} from './articles/HelpCenterEditArticleModalContent/types'

export const HelpCenterArticlesView: React.FC = () => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const articlesActions = useArticlesActions()
    const helpCenter = useCurrentHelpCenter()
    const {getHelpCenterCustomDomain} = useHelpCenterActions()
    const [isReady, setIsReady] = useState(false)

    /**
     * EditionManagerContext
     */
    const {
        selectedCategoryId,
        setSelectedCategoryId,
        selectedArticleLanguage,
        setSelectedArticleLanguage,
        selectedArticle,
        setSelectedArticle,
        editModal,
        setEditModal,
        isEditorCodeViewActive,
    } = useEditionManager()

    /**
     * States
     */
    // static states
    const limitations = useLimitations()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    // modal instance initializations
    const categoryModal = useModalManager(MODALS.CATEGORY, {autoDestroy: false})
    const articleModal = useModalManager(MODALS.ARTICLE, {autoDestroy: false})

    // modal states
    const [pendingDeleteLocaleOptionItem, setPendingDeleteLocaleOptionItem] =
        useState<OptionItem>()
    const [isPendingCloseArticle, setIsPendingCloseArticle] = useState(false)
    const [isPendingDiscardChanges, setIsPendingDiscardChanges] =
        useState(false)

    // article states
    const [selectedArticleTranslations, setSelectedArticleTranslations] =
        useState<ArticleTranslationWithRating[] | null>(null)
    const [
        selectedExistingArticleTranslation,
        setSelectedExistingArticleTranslation,
    ] = useState<ArticleTranslationWithRating | null>(null)
    const [isFetchingArticleTranslations, setIsFetchingArticleTranslations] =
        useState(false)

    // editor states
    const [counters, setCounters] = useState<{charCount: number}>()

    /**
     * Effects
     */
    useEffect(() => {
        // reset previous entities, register the createArticle action on the article modal opening
        articleModal.on(MODALS.ARTICLE, Event.afterOpen, onArticleCreate)
        dispatch(resetCategories())
        dispatch(resetArticles())
        setIsReady(true)
    }, [])

    useEffect(() => {
        void getHelpCenterCustomDomain()
    }, [])

    useEffect(() => {
        async function updateSelectedArticleTranslations() {
            if (
                !client ||
                !isExistingArticle(selectedArticle) ||
                isFetchingArticleTranslations ||
                selectedArticleTranslations
            ) {
                return
            }

            try {
                setIsFetchingArticleTranslations(true)

                const {
                    data: {data: translations},
                } = await client.listArticleTranslations({
                    help_center_id: helpCenter.id,
                    article_id: selectedArticle.id,
                    version_status: 'latest_draft',
                })

                const translation =
                    translations.find(({locale}) => locale === viewLanguage) ||
                    translations.find(({locale}) =>
                        helpCenter.supported_locales.includes(locale)
                    )

                if (translation) {
                    setSelectedArticleTranslations(translations)
                    setSelectedArticle({
                        ...selectedArticle,
                        translation,
                    })
                }

                if (selectedArticle.category_id !== undefined) {
                    setSelectedCategoryId(selectedArticle.category_id)
                }

                setSelectedExistingArticleTranslation(translation || null)
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch article translations',
                        status: NotificationStatus.Error,
                    })
                )
                reportError(err as Error)
            } finally {
                setIsFetchingArticleTranslations(false)
            }
        }

        void updateSelectedArticleTranslations()
    }, [
        client,
        helpCenter,
        viewLanguage,
        selectedArticle,
        selectedArticleTranslations,
        isFetchingArticleTranslations,
        dispatch,
    ])

    /**
     * Handlers
     */
    const onArticleModalClose = () => {
        articleModal.closeModal()
        setSelectedArticleLanguage(viewLanguage)
        setPendingDeleteLocaleOptionItem(undefined)
        closeModal()
    }

    const closeModal = () => {
        setEditModal((prevState) => ({
            ...prevState,
            isOpened: false,
        }))
        // close modal to reset its parameters (category_id)
        articleModal.closeModal()
    }

    const nextAction = useRef(closeModal)

    const onArticleCreate = () => {
        // FIXME: creating a template of an article should not select any article
        // we should separate the selection from the creation
        onArticleSelect({
            translation: getNewArticleTranslation(selectedArticleLanguage),
        })

        const categoryFromModalParams = articleModal.getParams()?.categoryId
        if (categoryFromModalParams !== undefined) {
            setSelectedCategoryId(articleModal.getParams()?.categoryId)
        } else {
            setSelectedCategoryId(null)
        }
    }

    const onCategoryCreate = () => {
        categoryModal.openModal(MODALS.CATEGORY, true, {
            isCreate: true,
        })
    }

    const onArticleChange = (
        {content}: {content: string},
        charCount?: number
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
                : prevSelectedArticle
        )

        if (typeof charCount === 'number') {
            setCounters({charCount})
        }
    }

    const onArticleSelect = (article: Article | CreateArticleDto) => {
        setSelectedArticleTranslations(null)
        setSelectedArticle(article)
        setEditModal({
            isOpened: true,
            view: HelpCenterArticleModalView.BASIC,
        })
    }

    const reloadArticle = (article: Article) => {
        setSelectedArticle(article)
        setSelectedExistingArticleTranslation(article.translation)

        const oldTranslations = selectedArticleTranslations ?? []

        setSelectedArticleTranslations([
            ...oldTranslations.filter(
                (translation) =>
                    translation.locale !== article.translation.locale
            ),
            article.translation,
        ])
    }

    const createArticle = async (
        article: CreateArticleDto | Article | null,
        isPublished: boolean
    ) => {
        if (!article?.translation) {
            return
        }

        try {
            const newArticle = await articlesActions.createArticle(
                {
                    ...article.translation,
                    is_current: isPublished,
                },
                selectedCategoryId
            )

            reloadArticle(newArticle)

            void dispatch(
                notify({
                    message: `Article created${
                        isPublished ? ' and published' : ''
                    } with success`,
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            const errorMessage =
                axios.isAxiosError(err) && err.response?.status === 400
                    ? 'some fields are empty or invalid.'
                    : 'please try again later.'

            void dispatch(
                notify({
                    message: `Failed to create the article: ${errorMessage}`,
                    status: NotificationStatus.Error,
                })
            )
            console.error(err)
        }
    }

    const updateArticle = async (
        article: Article | null,
        isPublished: boolean
    ) => {
        if (!article?.translation) {
            return
        }

        try {
            const updatedArticle = await articlesActions.updateArticle(
                helpCenter.default_locale,
                {
                    ...article,
                    translation: {
                        ...article.translation,
                        is_current: isPublished,
                    },
                },
                selectedCategoryId
            )

            reloadArticle(updatedArticle)

            void dispatch(
                notify({
                    message: `Article saved${
                        isPublished ? ' and published' : ''
                    } with success`,
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            const errorMessage =
                axios.isAxiosError(err) && err.response?.status === 400
                    ? 'some fields are empty or invalid.'
                    : 'please try again later.'

            void dispatch(
                notify({
                    message: `Failed to save the article: ${errorMessage}`,
                    status: NotificationStatus.Error,
                })
            )
            console.error(err)
        }
    }

    const onArticleDelete = async () => {
        if (!isExistingArticle(selectedArticle)) {
            return
        }

        try {
            await articlesActions.deleteArticle(selectedArticle.id)
            void dispatch(
                notify({
                    message: 'Article deleted with success',
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Failed to delete the article',
                    status: NotificationStatus.Error,
                })
            )
            console.error(err)
        } finally {
            setSelectedExistingArticleTranslation(null)
            setSelectedArticle(null)
            closeModal()
        }
    }

    const onArticlesReorder = (
        categoryId: number | null,
        articles: Article[]
    ): void => {
        void articlesActions.updateArticlesPositions(articles, categoryId)
    }

    // FIXME: separate into 3 distinct actions to avoid havind non-typed string action to provide
    const onArticleRowSettingsClick = async (
        action: string,
        article: Article
    ) => {
        if (action === 'articleSettings') {
            setSelectedArticleTranslations(null)
            setSelectedArticle(article)
            setEditModal({
                isOpened: true,
                view: HelpCenterArticleModalView.ADVANCED,
            })
        }

        if (action === 'copyToClipboard') {
            onCopyLinkToClipboard(article)
        }

        if (action === 'duplicateArticle') {
            try {
                await articlesActions.cloneArticle(article)

                void dispatch(
                    notify({
                        message: 'Article duplicated with success',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to duplicate the article',
                        status: NotificationStatus.Error,
                    })
                )
                console.error(err)
            }
        }
    }

    const onCopyLinkToClipboard = (article: Article) => {
        if (article.translation) {
            const {id: articleId, translation} = article
            const {locale, slug} = translation

            const domain = getHelpCenterDomain(helpCenter)

            try {
                copy(getArticleUrl({domain, locale, slug, articleId}))

                void dispatch(
                    notify({
                        message: 'Link copied with success',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to copy the link',
                        status: NotificationStatus.Error,
                    })
                )
                console.error(err)
            }
        }
        return
    }

    const onArticleLanguageSelect = (
        localeCode: LocaleCode,
        translation: ArticleTranslationWithRating | CreateArticleTranslationDto
    ) => {
        if (!selectedArticle) {
            return
        }
        if ('article_id' in translation) {
            setSelectedExistingArticleTranslation(translation)
        }
        setSelectedArticle((prevSelectedArticle) =>
            prevSelectedArticle
                ? {...prevSelectedArticle, translation}
                : prevSelectedArticle
        )
        setSelectedArticleLanguage(localeCode)
    }

    const onArticleLanguageSelectActionClick = (
        action: ActionType,
        option: OptionItem
    ) => {
        if (action === 'delete') {
            setPendingDeleteLocaleOptionItem(option)
        } else {
            onArticleLanguageSelectAttempt(option.value)
        }
    }

    const onArticleTranslationDeletionConfirm = () => {
        if (
            isExistingArticle(selectedArticle) &&
            pendingDeleteLocaleOptionItem
        ) {
            void articlesActions.deleteArticleTranslation(
                selectedArticle.id,
                pendingDeleteLocaleOptionItem.value
            )
        }
        onArticleModalClose()
    }

    const onArticleLanguageSelectAttempt = (localeCode: LocaleCode) => {
        if (canSaveArticle || isEditorCodeViewActive) {
            setIsPendingCloseArticle(true)
            nextAction.current = async () => {
                if (
                    client &&
                    selectedArticle &&
                    isExistingArticle(selectedArticle)
                ) {
                    const {
                        data: {data: translations},
                    } = await client.listArticleTranslations({
                        help_center_id: helpCenter.id,
                        article_id: selectedArticle.id,
                        version_status: 'latest_draft',
                    })
                    const translation =
                        translations.find(
                            ({locale}) => locale === localeCode
                        ) || getNewArticleTranslation(localeCode)
                    onArticleLanguageSelect(localeCode, translation)
                    setSelectedArticleTranslations(translations)
                }
            }
        } else {
            const translation =
                selectedArticleTranslations?.find(
                    ({locale: translationLocale}) =>
                        translationLocale === localeCode
                ) || getNewArticleTranslation(localeCode)
            if (translation) onArticleLanguageSelect(localeCode, translation)
        }
    }

    const onDiscardChangesAttempt = () => {
        if (canSaveArticle || isEditorCodeViewActive) {
            setIsPendingDiscardChanges(true)
            nextAction.current = closeModal
        } else {
            closeModal()
        }
    }

    const onCloseModalAttempt = () => {
        if (canSaveArticle || isEditorCodeViewActive) {
            setIsPendingCloseArticle(true)
            nextAction.current = closeModal
        } else {
            closeModal()
        }
    }

    const onConfirmDiscardChanges = () => {
        setIsPendingCloseArticle(false)
        setIsPendingDiscardChanges(false)
        nextAction.current()
    }

    const onConfirmEditing = () => {
        setIsPendingCloseArticle(false)
        setIsPendingDiscardChanges(false)
    }

    const onConfirmSaveArticle = async () => {
        if (isExistingArticle(selectedArticle)) {
            setSelectedArticle({
                ...selectedArticle,
                available_locales: selectedArticle.available_locales.includes(
                    selectedArticleLanguage
                )
                    ? selectedArticle.available_locales
                    : [
                          ...selectedArticle.available_locales,
                          selectedArticleLanguage,
                      ],
            })

            await updateArticle(selectedArticle, false)
        } else {
            await createArticle(selectedArticle, false)
        }

        setIsPendingCloseArticle(false)
        if (isExistingArticle(selectedArticle)) nextAction.current()
    }

    const renderArticleEditModalContent = (articleMode: ArticleMode) => {
        if (!selectedArticle?.translation) {
            return null
        }

        const autoFocus =
            editModal.isOpened && !isExistingArticle(selectedArticle)

        switch (editModal.view) {
            case HelpCenterArticleModalView.BASIC:
                return (
                    <HelpCenterArticleModalBasicViewContent
                        canSaveArticle={canSaveArticle}
                        counters={counters}
                        onArticleChange={onArticleChange}
                        onArticleLanguageSelect={onArticleLanguageSelectAttempt}
                        onArticleLanguageSelectActionClick={
                            onArticleLanguageSelectActionClick
                        }
                        onArticleModalClose={onCloseModalAttempt}
                        onChangesDiscard={onDiscardChangesAttempt}
                        onCopyLinkToClipboard={onCopyLinkToClipboard}
                        requiredFieldsArticle={requiredFieldsArticle}
                        autoFocus={autoFocus}
                        articleMode={articleMode}
                    />
                )
            case HelpCenterArticleModalView.ADVANCED:
                return (
                    <HelpCenterArticleModalAdvancedViewContent
                        onArticleLanguageSelect={onArticleLanguageSelectAttempt}
                        onArticleModalClose={onCloseModalAttempt}
                        onArticleLanguageSelectActionClick={
                            onArticleLanguageSelectActionClick
                        }
                        canSaveArticle={canSaveArticle}
                        requiredFieldsArticle={requiredFieldsArticle}
                        onChangesDiscard={onDiscardChangesAttempt}
                        onCopyLinkToClipboard={onCopyLinkToClipboard}
                        autoFocus={autoFocus}
                        articleMode={articleMode}
                    />
                )
            default:
                return null
        }
    }

    /**
     * Derived values
     */
    const {
        canSaveArticle,
        articleModified,
        requiredFieldsArticle,
    }: {
        canSaveArticle: boolean
        articleModified: boolean
        requiredFieldsArticle: typeof articleRequiredFields
    } = useMemo(() => {
        const currentTranslation = selectedArticle?.translation
        const requiredFieldsArticle: typeof articleRequiredFields = []

        if (
            articlesActions.isLoading ||
            !currentTranslation ||
            isEditorCodeViewActive
        ) {
            return {
                canSaveArticle: false,
                articleModified: false,
                requiredFieldsArticle,
            }
        }

        const filledRequired = articleRequiredFields.every((key) => {
            const isFieldFilled = Boolean(currentTranslation[key])
            if (!isFieldFilled) {
                requiredFieldsArticle.push(key)
            }

            return isFieldFilled
        })

        if (!selectedExistingArticleTranslation) {
            return {
                canSaveArticle: filledRequired,
                articleModified: false,
                requiredFieldsArticle,
            }
        }

        const translationHasBeenChanged = !_isEqual(
            currentTranslation,
            selectedExistingArticleTranslation
        )

        // selectedArticle?.category_id is number | undefined | null, we want to compare it to number | null
        const oldCategory = selectedArticle?.category_id ?? null
        const categoryHasBeenChanged = oldCategory !== selectedCategoryId

        const articleModified =
            categoryHasBeenChanged || translationHasBeenChanged

        return {
            canSaveArticle: filledRequired && articleModified,
            articleModified,
            requiredFieldsArticle,
        }
    }, [
        articlesActions.isLoading,
        selectedArticle,
        selectedExistingArticleTranslation,
        selectedCategoryId,
        isEditorCodeViewActive,
    ])

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            actions={
                <>
                    <Button intent="secondary" onClick={onCategoryCreate}>
                        Create Category
                    </Button>
                    <Button
                        isDisabled={limitations.createArticle.disabled}
                        onClick={onArticleCreate}
                    >
                        Create Article
                    </Button>
                </>
            }
            fluidContainer={false}
            className={css.wrapper}
        >
            <MaxArticleBanner
                nbArticles={limitations.createArticle.currentNumber}
            />
            {isReady && (
                <CategoriesViews
                    helpCenter={helpCenter}
                    onCreateArticle={onArticleCreate}
                    onCreateCategory={onCategoryCreate}
                    renderArticleList={(categoryId, articles, level) => (
                        <ArticlesTable
                            isNested
                            categoryId={categoryId}
                            level={level}
                            articles={articles}
                            onClick={onArticleSelect}
                            onReorderFinish={onArticlesReorder}
                            onClickSettings={onArticleRowSettingsClick}
                        />
                    )}
                />
            )}
            <CategoryDrawer helpCenter={helpCenter} />
            <HelpCenterEditModal
                isLoading={isFetchingArticleTranslations}
                portalRootId="app-root"
                onBackdropClick={onCloseModalAttempt}
                transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
            >
                {renderArticleEditModalContent(
                    getArticleMode(selectedArticle, articleModified, {
                        createArticle,
                        deleteArticle: onArticleDelete,
                        updateArticle,
                    })
                )}
            </HelpCenterEditModal>

            {isPendingCloseArticle && (
                <CloseModal
                    isOpen={
                        !!isPendingCloseArticle &&
                        (canSaveArticle || isEditorCodeViewActive)
                    }
                    title={<span>Are you sure?</span>}
                    style={{width: '100%', maxWidth: 500}}
                    saveText="Save article"
                    discardText="Discard changes"
                    editText="Edit article"
                    onDiscard={onConfirmDiscardChanges}
                    onContinueEditing={onConfirmEditing}
                    onSave={onConfirmSaveArticle}
                >
                    <span>
                        If you close this article, you'll lose all changes made.{' '}
                        {canSaveArticle && (
                            <span>Do you want to save them?</span>
                        )}
                    </span>
                </CloseModal>
            )}

            {isPendingDiscardChanges && (
                <DiscardChangesModal
                    title="Quit without Saving?"
                    onDiscard={onConfirmDiscardChanges}
                    onContinueEditing={onConfirmEditing}
                >
                    By discarding changes you will lose all progress you made
                    editing. Are you sure you want to proceed?
                </DiscardChangesModal>
            )}

            {pendingDeleteLocaleOptionItem && (
                <ConfirmationModal
                    isOpen={true}
                    confirmText={`Delete ${pendingDeleteLocaleOptionItem?.text}`}
                    title={
                        <span>
                            Are you sure you want to delete{' '}
                            {pendingDeleteLocaleOptionItem?.label} for this
                            article?
                        </span>
                    }
                    style={{width: '100%', maxWidth: 610}}
                    onClose={() => setPendingDeleteLocaleOptionItem(undefined)}
                    onConfirm={onArticleTranslationDeletionConfirm}
                >
                    <span>
                        You will lose all content saved and published of this
                        language ({pendingDeleteLocaleOptionItem?.label}) for
                        this article. You can’t undo this action, you’ll have to
                        compose again all the content for this language if you
                        decide to add it.
                    </span>
                </ConfirmationModal>
            )}
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterArticlesView
