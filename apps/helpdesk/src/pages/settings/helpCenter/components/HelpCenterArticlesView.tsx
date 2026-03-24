import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { usePrevious } from '@repo/hooks'
import { logEvent, reportError, SegmentEvent } from '@repo/logging'
import copy from 'copy-to-clipboard'
import _isEqual from 'lodash/isEqual'
import { useLocation } from 'react-router-dom'

import { useLimitations } from 'hooks/helpCenter/useLimitations'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Event, useModalManager } from 'hooks/useModalManager'
import { useSearchParam } from 'hooks/useSearchParam'
import type {
    Article,
    ArticleTemplate,
    ArticleTranslationWithRating,
    CreateArticleDto,
    CreateArticleTranslationDto,
    LocaleCode,
} from 'models/helpCenter/types'
import { useKnowledgeTracking } from 'pages/aiAgent/hooks/useKnowledgeTracking'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { resetArticles } from 'state/entities/helpCenter/articles'
import { resetCategories } from 'state/entities/helpCenter/categories'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { changeViewLanguage, getViewLanguage } from 'state/ui/helpCenter'
import { unreachable } from 'utils'

import type { ArticleRowActionTypes } from '../constants'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_CREATE_ARTICLE_FROM_SCRATCH_QUERY_VALUE,
    HELP_CENTER_CREATE_ARTICLE_QUERY_KEY,
    HELP_CENTER_DEFAULT_LAYOUT,
    HELP_CENTER_DEFAULT_LOCALE,
    MODALS,
} from '../constants'
import { useArticlesActions } from '../hooks/useArticlesActions'
import useCurrentHelpCenter from '../hooks/useCurrentHelpCenter'
import { useHelpCenterActions } from '../hooks/useHelpCenterActions'
import { useAbilityChecker, useHelpCenterApi } from '../hooks/useHelpCenterApi'
import { useEditionManager } from '../providers/EditionManagerContext'
import { useSearchContext } from '../providers/SearchContext'
import {
    useGetArticleTemplate,
    useUpsertArticleTemplateReview,
} from '../queries'
import type { ArticleMode } from '../types/articleMode'
import { getArticleMode } from '../types/articleMode'
import { getGenericMessageFromError } from '../utils'
import {
    articleRequiredFields,
    getArticleUrl,
    getHelpCenterDomain,
    getHomePageItemHashUrl,
    getNewArticleTranslation,
    isArticleTemplateKey,
    isExistingArticle,
    slugify,
} from '../utils/helpCenter.utils'
import type { ActionType, OptionItem } from './articles/ArticleLanguageSelect'
import { CloseModal } from './articles/CloseModal'
import HelpCenterArticleModalAdvancedViewContent from './articles/HelpCenterEditArticleModalContent/HelpCenterArticleModalAdvancedViewContent'
import HelpCenterArticleModalBasicViewContent from './articles/HelpCenterEditArticleModalContent/HelpCenterArticleModalBasicViewContent'
import { HelpCenterArticleModalView } from './articles/HelpCenterEditArticleModalContent/types'
import HelpCenterEditModal from './articles/HelpCenterEditModal'
import { ArticlesTable } from './ArticlesTable'
import { CategoriesViews } from './CategoriesView'
import { CategoryDrawer } from './CategoryDrawer'
import { ConfirmationModal } from './ConfirmationModal'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import HelpCenterWizardCompletedModal from './HelpCenterWizardCompletedModal/HelpCenterWizardCompletedModal'
import MaxArticleBanner from './Paywalls/MaxArticleBanner'
import { SearchView } from './SearchView'

import css from './HelpCenterArticlesView.less'

export const HelpCenterArticlesView: React.FC = () => {
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()
    const articlesActions = useArticlesActions()
    const helpCenter = useCurrentHelpCenter()
    const { getHelpCenterCustomDomain } = useHelpCenterActions()
    const [isReady, setIsReady] = useState(false)
    const { setSearchInput } = useSearchContext()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const [createArticleSeachParam, setCreateArticleSeachParam] =
        useSearchParam(HELP_CENTER_CREATE_ARTICLE_QUERY_KEY)

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
        selectedTemplateKey,
        setSelectedTemplateKey,
    } = useEditionManager()

    const { searchResults } = useSearchContext()

    const { isPassingRulesCheck } = useAbilityChecker()

    const { onKnowledgeContentCreated, onKnowledgeContentEdited } =
        useKnowledgeTracking({ shopName: helpCenter?.shop_name ?? '' })

    /**
     * States
     */
    // static states
    const limitations = useLimitations()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    // modal instance initializations
    const categoryModal = useModalManager(MODALS.CATEGORY, {
        autoDestroy: false,
    })
    const articleModal = useModalManager(MODALS.ARTICLE, { autoDestroy: false })

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
    const [counters, setCounters] = useState<{ charCount: number }>()

    const { data: template } = useGetArticleTemplate(
        selectedTemplateKey,
        viewLanguage,
        {
            refetchOnWindowFocus: false,
            retry: false,
        },
    )

    // template states
    const [showTemplates, setShowTemplates] = useState(false)

    const hasDefaultLayout = helpCenter.layout === HELP_CENTER_DEFAULT_LAYOUT

    const location = useLocation()

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
        if (
            createArticleSeachParam ===
            HELP_CENTER_CREATE_ARTICLE_FROM_SCRATCH_QUERY_VALUE
        ) {
            articleModal.openModal(MODALS.ARTICLE)
            setCreateArticleSeachParam(null)
        }
    }, [articleModal, createArticleSeachParam, setCreateArticleSeachParam])

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const articleId = params.get('article_id')

        if (articleId && client) {
            const fetchAndSetArticle = async (articleId: string) => {
                try {
                    const { data: fetchedArticle } = await client.getArticle({
                        id: Number(articleId),
                        help_center_id: helpCenter.id,
                        locale: 'en-US',
                        version_status: 'latest_draft',
                    })
                    setSelectedArticle({
                        ...fetchedArticle,
                        position: 0,
                        rating: { up: 0, down: 0 },
                        translation: {
                            ...fetchedArticle.translation,
                            rating: { up: 0, down: 0 },
                        },
                    })
                    setEditModal({
                        isOpened: true,
                        view: HelpCenterArticleModalView.BASIC,
                    })
                } catch (err) {
                    void dispatch(
                        notify({
                            message: 'Failed to fetch article',
                            status: NotificationStatus.Error,
                        }),
                    )
                    reportError(err as Error)
                }
            }

            void fetchAndSetArticle(articleId)
        }
    }, [
        client,
        dispatch,
        helpCenter.default_locale,
        helpCenter.id,
        location.search,
        setEditModal,
        setSelectedArticle,
    ])

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
                    data: { data: translations },
                } = await client.listArticleTranslations({
                    help_center_id: helpCenter.id,
                    article_id: selectedArticle.id,
                    version_status: 'latest_draft',
                })

                const translation =
                    translations.find(
                        ({ locale }) => locale === viewLanguage,
                    ) ||
                    translations.find(({ locale }) =>
                        helpCenter.supported_locales.includes(locale),
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
                        selectedArticle.translation.category_id,
                    )
                }

                setSelectedExistingArticleTranslation(translation || null)
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch article translations',
                        status: NotificationStatus.Error,
                    }),
                )
                reportError(err as Error)
            } finally {
                setIsFetchingArticleTranslations(false)
            }
        }

        void updateSelectedArticleTranslations()
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [
        client,
        helpCenter,
        viewLanguage,
        selectedArticle,
        selectedArticleTranslations,
        isFetchingArticleTranslations,
        dispatch,
    ]) /* eslint-enable react-hooks/exhaustive-deps */

    // update the selected article translations when the view language
    // or when the template changes
    useEffect(() => {
        if (!template) {
            return
        }

        const content = (
            selectedArticle?.translation.content ||
            template?.html_content ||
            ''
        )?.replace(/\\n/g, '')
        const title =
            selectedArticle?.translation.title || template?.title || ''
        const slug = slugify(title)

        if (isExistingArticle(selectedArticle)) {
            setSelectedArticle({
                ...selectedArticle,
                translation: {
                    ...selectedArticle.translation,
                    content,
                    title,
                    slug,
                },
            })
        } else {
            setSelectedArticle({
                translation: {
                    ...getNewArticleTranslation(
                        selectedArticleLanguage,
                        selectedCategoryId,
                    ),
                    content,
                    title,
                    slug,
                },
            })
        }

        // we only need to update the selected article translations when the template or the view language changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewLanguage, template])

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
        setSelectedTemplateKey(null)
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
                categoryFromModalParams,
            ),
        })

        setSelectedCategoryId(categoryFromModalParams)
    }

    const onCreateArticleWithTemplate = (template?: ArticleTemplate) => {
        setSelectedTemplateKey(null)
        const categoryFromModalParams =
            articleModal.getParams()?.categoryId ?? null

        onArticleSelect(
            {
                translation: getNewArticleTranslation(
                    selectedArticleLanguage,
                    categoryFromModalParams,
                ),
            },
            template,
        )

        setSelectedCategoryId(categoryFromModalParams)
    }

    const onCategoryCreate = () => {
        categoryModal.openModal(MODALS.CATEGORY, true, {
            isCreate: true,
        })
    }

    const onArticleChange = (
        { content }: { content: string },
        charCount?: number,
    ) => {
        setSelectedArticle((prevSelectedArticle) =>
            prevSelectedArticle?.translation
                ? ({
                      ...prevSelectedArticle,
                      translation: {
                          ...prevSelectedArticle.translation,
                          content,
                      },
                  } as Article | CreateArticleDto)
                : prevSelectedArticle,
        )

        if (typeof charCount === 'number') {
            setCounters({ charCount })
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
            } as Article | CreateArticleDto)
        }
    }

    const onArticleSelect = (
        article: Article | CreateArticleDto,
        template?: ArticleTemplate,
    ) => {
        setSelectedArticleTranslations(null)

        const templateKey = article.template_key || template?.key

        setSelectedTemplateKey(
            isArticleTemplateKey(templateKey) ? templateKey : null,
        )

        setSelectedArticle({
            ...article,
            template_key: templateKey,
        })
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
            ...oldTranslations.filter(
                (translation) =>
                    translation.locale !== article.translation.locale,
            ),
            article.translation,
        ])

        resetSearch()
    }

    const createArticle = async (
        article: CreateArticleDto | Article | null,
        isPublished: boolean,
    ) => {
        if (!article?.translation) {
            return
        }

        try {
            const newArticle = await articlesActions.createArticle(
                {
                    ...article.translation,
                    is_current: isPublished,
                } as CreateArticleTranslationDto,
                selectedTemplateKey,
            )

            reloadArticle(newArticle)
            setShowTemplates(false)

            if (selectedTemplateKey) {
                logEvent(
                    SegmentEvent.HelpCenterTemplatesArticleFromTemplateCreated,
                    {
                        template_key: selectedTemplateKey,
                    },
                )
            }

            onKnowledgeContentCreated({
                type: 'help-center-article',
                createdFrom: 'help-center-settings',
                createdHow: !!selectedTemplateKey
                    ? 'from-template'
                    : 'from-scratch',
            })

            void dispatch(
                notify({
                    message: `Article created${
                        isPublished ? ' and published' : ''
                    } with success`,
                    status: NotificationStatus.Success,
                }),
            )
        } catch (err) {
            const errorMessage = getGenericMessageFromError(err)

            void dispatch(
                notify({
                    message: `Failed to create the article: ${errorMessage}`,
                    status: NotificationStatus.Error,
                }),
            )
            reportError(err as Error)
        }
    }

    const reviewArticle = useUpsertArticleTemplateReview()

    const updateArticle = async (
        article: Article | null,
        isPublished: boolean,
    ) => {
        if (!article?.translation) {
            return
        }

        const isAIArticle = article.template_key?.startsWith('ai_')
        const isAlreadyPublished = article.translation.is_current
        const updateAIArticleTemplateReview =
            isAIArticle && !isAlreadyPublished && isPublished

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
            )

            reloadArticle(updatedArticle)
            setShowTemplates(false)

            if (updateAIArticleTemplateReview && article.template_key) {
                await reviewArticle.mutateAsync([
                    undefined,
                    { help_center_id: helpCenter.id },
                    { action: 'publish', template_key: article.template_key },
                ])
            }

            onKnowledgeContentEdited({
                type: 'help-center-article',
                editedFrom: 'help-center-settings',
            })

            void dispatch(
                notify({
                    message: `Article saved${
                        isPublished ? ' and published' : ''
                    } with success`,
                    status: NotificationStatus.Success,
                }),
            )
        } catch (err) {
            const errorMessage = getGenericMessageFromError(err)

            void dispatch(
                notify({
                    message: `Failed to save the article: ${errorMessage}`,
                    status: NotificationStatus.Error,
                }),
            )
            reportError(err as Error)
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
                }),
            )
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Failed to delete the article',
                    status: NotificationStatus.Error,
                }),
            )
            reportError(err as Error)
        } finally {
            setSelectedExistingArticleTranslation(null)
            setSelectedArticle(null)
            closeModal()
            resetSearch()
        }
    }

    const onArticlesReorder = (
        categoryId: number | null,
        articles: Article[],
    ): void => {
        void articlesActions.updateArticlesPositions(articles, categoryId)
        resetSearch()
    }

    const onArticleRowSettingsClick = async (
        action: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean,
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
                        }),
                    )
                } catch (err) {
                    void dispatch(
                        notify({
                            message: 'Failed to duplicate the article',
                            status: NotificationStatus.Error,
                        }),
                    )
                    reportError(err as Error)
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
        const { id: articleId, translation } = article
        const { locale, slug, article_unlisted_id: unlistedId } = translation

        const domain = getHelpCenterDomain(helpCenter)

        try {
            copy(
                hasDefaultLayout
                    ? getArticleUrl({
                          domain,
                          locale,
                          slug,
                          articleId,
                          unlistedId,
                          isUnlisted,
                      })
                    : getHomePageItemHashUrl({
                          itemType: 'article',
                          domain,
                          locale,
                          itemId: articleId,
                          isUnlisted,
                      }),
            )

            void dispatch(
                notify({
                    message: 'Link copied with success',
                    status: NotificationStatus.Success,
                }),
            )
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Failed to copy the link',
                    status: NotificationStatus.Error,
                }),
            )
            reportError(err as Error)
        }
    }

    const onArticleLanguageSelect = (
        localeCode: LocaleCode,
        translation: ArticleTranslationWithRating | CreateArticleTranslationDto,
    ) => {
        if (!selectedArticle) {
            return
        }
        if ('article_id' in translation) {
            setSelectedExistingArticleTranslation(translation)
        }
        setSelectedArticle((prevSelectedArticle) =>
            prevSelectedArticle
                ? ({ ...prevSelectedArticle, translation } as
                      | Article
                      | CreateArticleDto)
                : prevSelectedArticle,
        )
        setSelectedArticleLanguage(localeCode)
    }

    const onArticleLanguageSelectActionClick = (
        action: ActionType,
        option: OptionItem,
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
                pendingDeleteLocaleOptionItem.value,
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
                        data: { data: translations },
                    } = await client.listArticleTranslations({
                        help_center_id: helpCenter.id,
                        article_id: selectedArticle.id,
                        version_status: 'latest_draft',
                    })
                    const translation =
                        translations.find(
                            ({ locale }) => locale === localeCode,
                        ) ??
                        getNewArticleTranslation(localeCode, selectedCategoryId)
                    onArticleLanguageSelect(localeCode, translation)
                    setSelectedArticleTranslations(translations)
                } else {
                    const translation = getNewArticleTranslation(
                        localeCode,
                        selectedCategoryId,
                    )
                    onArticleLanguageSelect(localeCode, translation)
                }
            }
        } else {
            const translation =
                selectedArticleTranslations?.find(
                    ({ locale: translationLocale }) =>
                        translationLocale === localeCode,
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

    const resetPendingStates = () => {
        setIsPendingCloseArticle(false)
        setIsPendingDiscardChanges(false)
    }

    const onConfirmDiscardChanges = () => {
        resetPendingStates()
        nextAction.current()
    }

    const onConfirmSaveArticle = async () => {
        if (isExistingArticle(selectedArticle)) {
            setSelectedArticle({
                ...selectedArticle,
                available_locales: selectedArticle.available_locales.includes(
                    selectedArticleLanguage,
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

        resetPendingStates()
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

    const onShowTemplates = () => {
        setShowTemplates((showTemplates) => !showTemplates)
    }

    const canUpdateArticle = isPassingRulesCheck(({ can }) =>
        can('update', 'ArticleEntity'),
    )

    const canUpdateCategory = isPassingRulesCheck(({ can }) =>
        can('update', 'CategoryEntity'),
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
            selectedExistingArticleTranslation,
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
            fluidContainer={false}
            className={css.wrapper}
        >
            <MaxArticleBanner
                nbArticles={limitations.createArticle.currentNumber}
            />
            {!showTemplates && (
                <SearchView
                    helpCenter={helpCenter}
                    onArticleClick={onArticleSelect}
                    onArticleClickSettings={onArticleRowSettingsClick}
                    onArticleCreate={onArticleCreate}
                    onShowTemplates={onShowTemplates}
                    onCategoryCreate={onCategoryCreate}
                    canUpdateArticle={
                        canUpdateArticle && !limitations.createArticle.disabled
                    }
                    canUpdateCategory={canUpdateCategory}
                />
            )}

            {isReady && !isSearching && (
                <CategoriesViews
                    helpCenter={helpCenter}
                    onCreateArticle={onArticleCreate}
                    onCreateArticleWithTemplate={onCreateArticleWithTemplate}
                    onCreateCategory={onCategoryCreate}
                    showTemplates={showTemplates}
                    onShowTemplates={onShowTemplates}
                    renderArticleList={(
                        categoryId,
                        articles,
                        level,
                        isUnlisted,
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
                    }),
                )}
            </HelpCenterEditModal>

            {(isPendingCloseArticle || isPendingDiscardChanges) && (
                <CloseModal
                    isOpen={
                        (isPendingDiscardChanges || isPendingCloseArticle) &&
                        (canSaveArticle || isEditorCodeViewActive)
                    }
                    title={
                        isPendingCloseArticle
                            ? 'Unsaved changes'
                            : 'Quit without saving?'
                    }
                    saveText="Save"
                    discardText="Don't save"
                    editText="Back to editing"
                    onDiscard={onConfirmDiscardChanges}
                    onContinueEditing={resetPendingStates}
                    onSave={onConfirmSaveArticle}
                >
                    {isPendingCloseArticle
                        ? "Do you want to save the changes made to this article? All changes will be lost if you don't save them."
                        : 'By discarding changes you will lose all progress you made editing. Are you sure you want to proceed?'}
                </CloseModal>
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
                    style={{ width: '100%', maxWidth: 610 }}
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

            <HelpCenterWizardCompletedModal />
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterArticlesView
