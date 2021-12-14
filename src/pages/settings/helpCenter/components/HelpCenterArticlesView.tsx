import React, {useCallback, useEffect, useMemo, useState} from 'react'
import axios from 'axios'
import classnames from 'classnames'
import copy from 'copy-to-clipboard'
import _isEqual from 'lodash/isEqual'
import {useSelector} from 'react-redux'
import {Button, Container} from 'reactstrap'

import {useLimitations} from '../../../../hooks/helpCenter/useLimitations'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {Event, useModalManager} from '../../../../hooks/useModalManager'
import {SCREEN_SIZE, useScreenSize} from '../../../../hooks/useScreenSize'
import {
    Article,
    ArticleTranslation,
    CreateArticleDto,
    LocaleCode,
} from '../../../../models/helpCenter/types'
import {resetArticles} from '../../../../state/helpCenter/articles'
import {resetCategories} from '../../../../state/helpCenter/categories'
import {getViewLanguage} from '../../../../state/helpCenter/ui'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {reportError} from '../../../../utils/errors'
import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import {
    DRAWER_TRANSITION_DURATION_MS,
    HELP_CENTER_DEFAULT_LOCALE,
    MODALS,
} from '../constants'
import {useArticlesActions} from '../hooks/useArticlesActions'
import {useCurrentHelpCenter} from '../hooks/useCurrentHelpCenter'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {SupportedLocalesProvider} from '../providers/SupportedLocales'
import {
    articleRequiredFields,
    getArticleUrl,
    getHelpCenterDomain,
    getNewArticleTranslation,
    isExistingArticle,
} from '../utils/helpCenter.utils'

import {ActionType, OptionItem} from './articles/ArticleLanguageSelect'
import {CloseArticleModal} from './articles/CloseArticleModal'
import HelpCenterEditModal from './articles/HelpCenterEditModal'
import {ArticlesTable} from './ArticlesTable'
import {CategoryDrawer} from './CategoryDrawer'
import {CategoriesViews} from './CategoriesView'
import {ConfirmationModal} from './ConfirmationModal'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import MaxArticleBanner from './Paywalls/MaxArticleBanner'

import css from './HelpCenterArticlesView.less'
import HelpCenterArticleModalBasicViewContent from './articles/HelpCenterEditArticleModalContent/HelpCenterArticleModalBasicViewContent'
import HelpCenterArticleModalAdvancedViewContent from './articles/HelpCenterEditArticleModalContent/HelpCenterArticleModalAdvancedViewContent'
import {
    HelpCenterArticleModalView,
    HelpCenterArticleModalState,
} from './articles/HelpCenterEditArticleModalContent/types'

export const HelpCenterArticlesView = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const articlesActions = useArticlesActions()
    const {helpCenter, getHelpCenterCustomDomain} = useCurrentHelpCenter()

    /**
     * States
     */
    // static states
    const limitations = useLimitations()
    const helpCenterId = useHelpCenterIdParam()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    // modal instance initializations
    const categoryModal = useModalManager(MODALS.CATEGORY, {autoDestroy: false})
    const articleModal = useModalManager(MODALS.ARTICLE, {autoDestroy: false})

    // modal states
    const [editModal, setEditModal] = useState<HelpCenterArticleModalState>({
        isOpened: false,
        view: null,
    })
    const [pendingDeleteLocaleOptionItem, setPendingDeleteLocaleOptionItem] =
        useState<OptionItem>()
    const [isPendingCloseArticle, setIsPendingCloseArticle] = useState(false)
    const screenSize = useScreenSize()
    const [isFullscreenEditModal, setIsFullscreenEditModal] = useState(false)

    // article states
    const [selectedArticle, setSelectedArticle] = useState<
        CreateArticleDto | Article | null
    >(null)
    const [selectedArticleTranslations, setSelectedArticleTranslations] =
        useState<ArticleTranslation[] | null>(null)
    const [
        selectedExistingArticleTranslation,
        setSelectedExistingArticleTranslation,
    ] = useState<ArticleTranslation | null>(null)
    const [selectedArticleLanguage, setSelectedArticleLanguage] =
        useState(viewLanguage)
    const [isFetchingArticleTranslations, setIsFetchingArticleTranslations] =
        useState(false)

    // category states
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null
    )

    // editor states
    const [counters, setCounters] = useState<{
        charCount: number
        wordCount: number
    }>()
    const [isEditorCodeViewActive, setIsEditorCodeViewActive] = useState(false)

    /**
     * Effects
     */
    useEffect(() => {
        // reset previous entities, register the createArticle action on the article modal opening
        articleModal.on(MODALS.ARTICLE, Event.afterOpen, onArticleCreate)
        dispatch(resetCategories())
        dispatch(resetArticles())
    }, [])

    useEffect(() => {
        void getHelpCenterCustomDomain()
    }, [helpCenter !== null])

    // Make sure to exit fullscreen mode when modal view changes
    useEffect(() => {
        if (isFullscreenEditModal) {
            setIsFullscreenEditModal(false)
        }
    }, [editModal])

    // change the selected article locale whenever we change of selectedArticle
    // ??: is this effect still relevant?
    useEffect(() => {
        if (selectedArticle?.translation) {
            setSelectedArticleLanguage(selectedArticle.translation.locale)
        }
    }, [selectedArticle])

    useEffect(() => {
        async function updateSelectedArticleTranslations() {
            if (
                !client ||
                !helpCenter?.id ||
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
        setEditModal((prevState) => ({
            ...prevState,
            isOpened: false,
        }))
    }

    const onArticleCreate = () => {
        if (!helpCenter) {
            return
        }

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

    const onArticleChange = useCallback(
        ({content}: {content: string}, counters) => {
            setCounters(counters)
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
        },
        []
    )

    const onArticleSelect = (article: Article | CreateArticleDto) => {
        setSelectedArticleTranslations(null)
        setSelectedArticle(article)
        setEditModal({
            isOpened: true,
            view: HelpCenterArticleModalView.BASIC,
        })
    }

    const onArticleSave = async () => {
        if (!helpCenter || !selectedArticle?.translation) {
            return
        }

        // Create or update article
        try {
            if (isExistingArticle(selectedArticle)) {
                await articlesActions.updateArticle(
                    selectedArticle,
                    selectedCategoryId
                )
            } else {
                await articlesActions.createArticle(
                    selectedArticle.translation,
                    selectedCategoryId
                )
            }

            void dispatch(
                notify({
                    message: 'Article saved with success',
                    status: NotificationStatus.Success,
                })
            )

            setSelectedArticle(null)
            setEditModal((prevState) => ({
                ...prevState,
                isOpened: false,
            }))

            // close modal to reset its parameters (category_id)
            articleModal.closeModal()
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
        if (!helpCenter || !isExistingArticle(selectedArticle)) {
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
            setEditModal((prevState) => ({
                ...prevState,
                isOpened: false,
            }))
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
            if (article?.translation && helpCenter?.subdomain) {
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

    const onArticleLanguageSelect = (localeCode: LocaleCode) => {
        if (!helpCenter || !selectedArticle) {
            return
        }

        const translation =
            selectedArticleTranslations?.find(
                ({locale: translationLocale}) =>
                    translationLocale === localeCode
            ) || getNewArticleTranslation(localeCode)

        if ('article_id' in translation) {
            setSelectedExistingArticleTranslation(
                translation as ArticleTranslation
            )
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
            onArticleLanguageSelect(option.value)
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

    const onCloseArticleModalDiscardChanges = () => {
        setEditModal((prevState) => ({
            ...prevState,
            isOpened: false,
        }))
        setIsPendingCloseArticle(false)
    }

    const onCloseArticleModalResume = () => {
        setIsPendingCloseArticle(false)
    }

    const onCloseArticleModalSave = async () => {
        await onArticleSave()
        setEditModal((prevState) => ({
            ...prevState,
            isOpened: false,
        }))
        setIsPendingCloseArticle(false)
    }

    const renderArticleEditModalContent = () => {
        if (!selectedArticle?.translation || !helpCenter) {
            return null
        }

        const helpCenterDomain = getHelpCenterDomain(helpCenter)
        const articleLocales = isExistingArticle(selectedArticle)
            ? selectedArticle.available_locales
            : undefined

        switch (editModal.view) {
            case HelpCenterArticleModalView.BASIC:
                return (
                    <HelpCenterArticleModalBasicViewContent
                        canSaveArticle={canSaveArticle}
                        counters={counters}
                        helpCenter={helpCenter}
                        isFullscreenEditModal={isFullscreenEditModal}
                        onArticleChange={onArticleChange}
                        onArticleDelete={onArticleDelete}
                        onArticleLanguageSelect={onArticleLanguageSelect}
                        onArticleLanguageSelectActionClick={
                            onArticleLanguageSelectActionClick
                        }
                        onArticleModalClose={onArticleModalClose}
                        onArticleSave={onArticleSave}
                        selectedArticleLanguage={selectedArticleLanguage}
                        selectedArticle={selectedArticle}
                        screenSize={screenSize}
                        setIsFullscreenEditModal={setIsFullscreenEditModal}
                        setSelectedArticle={setSelectedArticle}
                        selectedCategoryId={selectedCategoryId}
                        setSelectedCategoryId={setSelectedCategoryId}
                        setEditModal={setEditModal}
                        setIsEditorCodeViewActive={setIsEditorCodeViewActive}
                        requiredFieldsArticle={requiredFieldsArticle}
                        articleLocales={articleLocales}
                    />
                )
            case HelpCenterArticleModalView.ADVANCED:
                return (
                    <HelpCenterArticleModalAdvancedViewContent
                        selectedArticle={selectedArticle}
                        helpCenter={helpCenter}
                        onArticleLanguageSelect={onArticleLanguageSelect}
                        onArticleModalClose={onArticleModalClose}
                        selectedArticleLanguage={selectedArticleLanguage}
                        setSelectedArticle={setSelectedArticle}
                        onArticleLanguageSelectActionClick={
                            onArticleLanguageSelectActionClick
                        }
                        setEditModal={setEditModal}
                        canSaveArticle={canSaveArticle}
                        requiredFieldsArticle={requiredFieldsArticle}
                        onArticleSave={onArticleSave}
                        onArticleDelete={onArticleDelete}
                        helpCenterDomain={helpCenterDomain}
                        articleLocales={articleLocales}
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
        requiredFieldsArticle,
    }: {
        canSaveArticle: boolean
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
                requiredFieldsArticle,
            }
        }

        const translationHasBeenChanged = !_isEqual(
            currentTranslation,
            selectedExistingArticleTranslation
        )
        const categoryHasBeenChanged =
            selectedArticle?.category_id !== selectedCategoryId

        return {
            canSaveArticle:
                filledRequired &&
                (categoryHasBeenChanged || translationHasBeenChanged),
            requiredFieldsArticle,
        }
    }, [
        articlesActions.isLoading,
        selectedArticle,
        selectedExistingArticleTranslation,
        selectedCategoryId,
        isEditorCodeViewActive,
    ])

    if (!helpCenter) {
        return (
            <Container fluid className="page-container">
                <Loader />
            </Container>
        )
    }

    return (
        <div className={classnames('full-width', css.wrapper)}>
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter.name}
                        activeLabel="Articles"
                    />
                }
            >
                <Button className="mr-2" onClick={onCategoryCreate}>
                    Create Category
                </Button>
                <Button
                    color="success"
                    onClick={onArticleCreate}
                    disabled={limitations.createArticle.disabled}
                >
                    Create Article
                </Button>
            </PageHeader>
            <HelpCenterNavigation helpCenterId={helpCenterId} />
            <SupportedLocalesProvider>
                <MaxArticleBanner
                    nbArticles={limitations.createArticle.currentNumber}
                />
                <CategoriesViews
                    helpCenter={helpCenter}
                    onCreateArticle={onArticleCreate}
                    onCreateCategory={onCategoryCreate}
                    renderArticleList={(categoryId, articles) => (
                        <ArticlesTable
                            isNested
                            categoryId={categoryId}
                            articles={articles}
                            onClick={onArticleSelect}
                            onReorderFinish={onArticlesReorder}
                            onClickSettings={onArticleRowSettingsClick}
                        />
                    )}
                />

                <CategoryDrawer helpCenter={helpCenter} />
                <HelpCenterEditModal
                    open={editModal.isOpened}
                    fullscreen={
                        isFullscreenEditModal ||
                        screenSize === SCREEN_SIZE.SMALL
                    }
                    isLoading={isFetchingArticleTranslations}
                    portalRootId="app-root"
                    onBackdropClick={() => {
                        if (canSaveArticle || isEditorCodeViewActive) {
                            setIsPendingCloseArticle(true)
                        } else {
                            setEditModal((prevState) => ({
                                ...prevState,
                                isOpened: false,
                            }))
                        }
                    }}
                    transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
                >
                    {renderArticleEditModalContent()}
                </HelpCenterEditModal>
                {isPendingCloseArticle && (
                    <CloseArticleModal
                        isOpen={
                            !!isPendingCloseArticle &&
                            (canSaveArticle || isEditorCodeViewActive)
                        }
                        title={<span>Are you sure?</span>}
                        style={{width: '100%', maxWidth: 500}}
                        onDiscard={onCloseArticleModalDiscardChanges}
                        onContinueEditing={onCloseArticleModalResume}
                        {...(canSaveArticle && {
                            onSave: onCloseArticleModalSave,
                        })}
                    >
                        <span>
                            If you close this article, you'll lose all changes
                            made.{' '}
                            {canSaveArticle && (
                                <span>Do you want to save them?</span>
                            )}
                        </span>
                    </CloseArticleModal>
                )}
                {pendingDeleteLocaleOptionItem && (
                    <ConfirmationModal
                        isOpen={!!pendingDeleteLocaleOptionItem}
                        confirmText={`Delete ${pendingDeleteLocaleOptionItem?.text}`}
                        title={
                            <span>
                                Are you sure you want to delete{' '}
                                {pendingDeleteLocaleOptionItem?.label} for this
                                article?
                            </span>
                        }
                        style={{width: '100%', maxWidth: 610}}
                        onClose={() =>
                            setPendingDeleteLocaleOptionItem(undefined)
                        }
                        onConfirm={onArticleTranslationDeletionConfirm}
                    >
                        <span>
                            You will lose all content saved and published of
                            this language (
                            {pendingDeleteLocaleOptionItem?.label}) for this
                            article. You can’t undo this action, you’ll have to
                            compose again all the content for this language if
                            you decide to add it.
                        </span>
                    </ConfirmationModal>
                )}
            </SupportedLocalesProvider>
        </div>
    )
}

export default HelpCenterArticlesView
