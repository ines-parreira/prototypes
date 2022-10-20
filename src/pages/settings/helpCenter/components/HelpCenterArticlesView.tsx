import React, {useEffect, useMemo, useRef, useState} from 'react'
import axios from 'axios'
import copy from 'copy-to-clipboard'
import _isEqual from 'lodash/isEqual'
import {usePrevious} from 'react-use'

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
import {changeViewLanguage, getViewLanguage} from 'state/ui/helpCenter'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'
import {unreachable} from 'utils'
import {
    ArticleRowActionTypes,
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_DEFAULT_LOCALE,
    MODALS,
} from '../constants'
import {useArticlesActions} from '../hooks/useArticlesActions'
import {useHelpCenterActions} from '../hooks/useHelpCenterActions'
import {useHelpCenterApi, useAbilityChecker} from '../hooks/useHelpCenterApi'
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
import {useSearchContext} from '../providers/SearchContext'

import {getCurrentAccountState} from '../../../../state/currentAccount/selectors'
import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'
import {getCurrentUser} from '../../../../state/currentUser/selectors'
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
import {SearchView} from './SearchView'

export const HelpCenterArticlesView: React.FC = () => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const articlesActions = useArticlesActions()
    const helpCenter = useCurrentHelpCenter()
    const {getHelpCenterCustomDomain} = useHelpCenterActions()
    const [isReady, setIsReady] = useState(false)
    const {setSearchInput} = useSearchContext()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)

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

    const {searchResults} = useSearchContext()

    const {isPassingRulesCheck} = useAbilityChecker()

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        void getHelpCenterCustomDomain()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                    if (translation.locale !== viewLanguage) {
                        dispatch(changeViewLanguage(translation.locale))
                    }

                    setSelectedArticle({
                        ...selectedArticle,
                        translation,
                    })
                }

                if (selectedArticle.translation.category_id !== undefined) {
                    setSelectedCategoryId(
                        selectedArticle.translation.category_id
                    )
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const categoryFromModalParams =
            articleModal.getParams()?.categoryId ?? null

        // FIXME: creating a template of an article should not select any article
        // we should separate the selection from the creation
        onArticleSelect({
            translation: getNewArticleTranslation(
                selectedArticleLanguage,
                categoryFromModalParams
            ),
        })

        setSelectedCategoryId(categoryFromModalParams)
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

    const onEditorReady = (content: string) => {
        // Set the initial translation content and the selected article translation
        // content once the Froala editor is done loading and pre-formatting the content
        if (selectedExistingArticleTranslation && selectedArticle) {
            setSelectedExistingArticleTranslation({
                ...selectedExistingArticleTranslation,
                content,
            })

            setSelectedArticle({
                ...selectedArticle,
                translation: {
                    ...selectedArticle.translation,
                    content,
                },
            })
        }
    }

    const onArticleSelect = (article: Article | CreateArticleDto) => {
        setSelectedArticleTranslations(null)
        setSelectedArticle(article)
        setEditModal({
            isOpened: true,
            view: HelpCenterArticleModalView.BASIC,
        })

        if ('id' in article) {
            logEvent(SegmentEvent.HelpCenterArticleRowClicked, {
                user_id: currentUser.get('id'),
                account_domain: currentAccount.get('domain'),
                article_id: article.id,
            })
        }
    }

    const resetSearch = () => {
        setSearchInput('')
    }

    const reloadArticle = (article: Article) => {
        setSelectedArticle(article)
        setSelectedExistingArticleTranslation(article.translation)

        const oldTranslations = selectedArticleTranslations ?? []

        setSelectedArticleTranslations([
            ...oldTranslations
                .filter(
                    (translation) =>
                        translation.locale !== article.translation.locale
                )
                .map((translation) => ({
                    ...translation,
                    visibility_status: article.translation.visibility_status,
                })),
            article.translation,
        ])

        resetSearch()
    }

    const createArticle = async (
        article: CreateArticleDto | Article | null,
        isPublished: boolean
    ) => {
        if (!article?.translation) {
            return
        }

        try {
            const newArticle = await articlesActions.createArticle({
                ...article.translation,
                is_current: isPublished,
            })

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
                }
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
            resetSearch()
        }
    }

    const onArticlesReorder = (
        categoryId: number | null,
        articles: Article[]
    ): void => {
        void articlesActions.updateArticlesPositions(articles, categoryId)
        resetSearch()
    }

    const onArticleRowSettingsClick = async (
        action: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean
    ) => {
        switch (action) {
            case 'articleSettings': {
                setSelectedArticleTranslations(null)
                setSelectedArticle(article)
                setEditModal({
                    isOpened: true,
                    view: HelpCenterArticleModalView.ADVANCED,
                })
                logEvent(SegmentEvent.HelpCenterArticleRowSettingsClicked, {
                    user_id: currentUser.get('id'),
                    account_domain: currentAccount.get('domain'),
                    article_id: article.id,
                })

                return
            }

            case 'copyToClipboard': {
                onCopyLinkToClipboard(article, isArticleOrAncestorUnlisted)

                return
            }

            case 'duplicateArticle': {
                try {
                    await articlesActions.cloneArticle(article)
                    resetSearch()

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

                return
            }

            default: {
                unreachable(action)
            }
        }
    }

    const onCopyLinkToClipboard = (article: Article, isUnlisted: boolean) => {
        if (!article.translation) {
            return
        }
        const {id: articleId, translation} = article
        const {locale, slug, article_unlisted_id: unlistedId} = translation

        const domain = getHelpCenterDomain(helpCenter)

        try {
            copy(
                getArticleUrl({
                    domain,
                    locale,
                    slug,
                    articleId,
                    unlistedId,
                    isUnlisted,
                })
            )

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
        resetSearch()
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
                        ) ??
                        getNewArticleTranslation(localeCode, selectedCategoryId)
                    onArticleLanguageSelect(localeCode, translation)
                    setSelectedArticleTranslations(translations)
                } else {
                    const translation = getNewArticleTranslation(
                        localeCode,
                        selectedCategoryId
                    )
                    onArticleLanguageSelect(localeCode, translation)
                }
            }
        } else {
            const translation =
                selectedArticleTranslations?.find(
                    ({locale: translationLocale}) =>
                        translationLocale === localeCode
                ) ?? getNewArticleTranslation(localeCode, selectedCategoryId)
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
                        onEditorReady={onEditorReady}
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

    const canUpdateArticle = isPassingRulesCheck(({can}) =>
        can('update', 'ArticleEntity')
    )

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
        if (!canUpdateArticle) {
            return {
                canSaveArticle: false,
                articleModified: false,
                requiredFieldsArticle: [],
            }
        }

        const currentTranslation = selectedArticle?.translation
        const requiredFieldsArticle: typeof articleRequiredFields = []

        const translationHasBeenChanged = !_isEqual(
            currentTranslation,
            selectedExistingArticleTranslation
        )

        // selectedArticle?.category_id is number | undefined | null, we want to compare it to number | null
        const oldCategory = selectedArticle?.translation.category_id ?? null
        const categoryHasBeenChanged = oldCategory !== selectedCategoryId

        const articleModified =
            categoryHasBeenChanged || translationHasBeenChanged

        if (
            articlesActions.isLoading ||
            !currentTranslation ||
            isEditorCodeViewActive
        ) {
            return {
                canSaveArticle: false,
                articleModified:
                    !!selectedExistingArticleTranslation && articleModified,
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

        return {
            canSaveArticle: filledRequired && articleModified,
            articleModified: articleModified,
            requiredFieldsArticle,
        }
    }, [
        articlesActions.isLoading,
        selectedArticle,
        selectedExistingArticleTranslation,
        selectedCategoryId,
        isEditorCodeViewActive,
        canUpdateArticle,
    ])

    const isSearching =
        searchResults !== null && searchResults.state !== 'error'

    const previousIsSearching = usePrevious(isSearching)

    useEffect(() => {
        /*
         * if we just switched from search results to no ongoing search,
         * then we must reset loaded categories and articles,
         * otherwise, CategoriesView will wrongly assume that the first 20 articles / categories are already loaded,
         * whilst it is not the case.
         */
        if (previousIsSearching && !isSearching) {
            dispatch(changeViewLanguage(helpCenter.default_locale))
            dispatch(resetCategories())
            dispatch(resetArticles())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSearching, previousIsSearching])

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            actions={
                <>
                    <Button
                        intent="secondary"
                        onClick={onCategoryCreate}
                        isDisabled={
                            !isPassingRulesCheck(({can}) =>
                                can('create', 'CategoryEntity')
                            )
                        }
                    >
                        Create Category
                    </Button>
                    <Button
                        isDisabled={
                            isPassingRulesCheck(({can}) =>
                                can('create', 'ArticleEntity')
                            )
                                ? limitations.createArticle.disabled
                                : true
                        }
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

            <SearchView
                helpCenter={helpCenter}
                onArticleClick={onArticleSelect}
                onArticleClickSettings={onArticleRowSettingsClick}
            />

            {isReady && !isSearching && (
                <CategoriesViews
                    helpCenter={helpCenter}
                    onCreateArticle={onArticleCreate}
                    onCreateCategory={onCategoryCreate}
                    renderArticleList={(
                        categoryId,
                        articles,
                        level,
                        isUnlisted
                    ) => (
                        <ArticlesTable
                            isNested
                            categoryId={categoryId}
                            level={level}
                            isAncestorUnlisted={isUnlisted}
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
