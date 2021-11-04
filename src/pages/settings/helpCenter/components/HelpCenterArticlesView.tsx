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
    CreateArticleTranslationDto,
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
    EDITOR_MODAL_CONTAINER_ID,
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
    slugify,
} from '../utils/helpCenter.utils'

import {ActionType, OptionItem} from './articles/ArticleLanguageSelect'
import {CloseArticleModal} from './articles/CloseArticleModal'
import HelpCenterEditAdvancedArticleForm from './articles/HelpCenterEditAdvancedArticleForm'
import HelpCenterEditArticleForm from './articles/HelpCenterEditArticleForm'
import HelpCenterEditModal from './articles/HelpCenterEditModal'
import HelpCenterEditModalFooter from './articles/HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from './articles/HelpCenterEditModalHeader'
import {ArticlesTable} from './ArticlesTable'
import {CategoryDrawer} from './CategoryDrawer'
import {CategoriesViews} from './CategoriesView'
import {ConfirmationModal} from './ConfirmationModal'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import MaxArticleBanner from './Paywalls/MaxArticleBanner'

import css from './HelpCenterArticlesView.less'

type HelpCenterModalState = {
    opened: boolean
    content: HelpCenterModalContent | null
}

enum HelpCenterModalContent {
    ARTICLE = 'article',
    ARTICLE_ADVANCED = 'article-advanced',
}

const isExistingArticle = (
    article: CreateArticleDto | Article | null
): article is Article => (article ? 'id' in article : false)

export const HelpCenterArticlesView = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [editModal, setEditModal] = useState<HelpCenterModalState>({
        opened: false,
        content: null,
    })
    const [selectedArticle, setSelectedArticle] = useState<
        CreateArticleDto | Article | null
    >(null)
    const [
        savedTranslation,
        setSavedTranslation,
    ] = useState<ArticleTranslation | null>(null)
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null
    )
    const [
        selectedArticleTranslations,
        setSelectedArticleTranslations,
    ] = useState<ArticleTranslation[] | null>(null)
    const [articleLanguage, setArticleLanguage] = useState(viewLanguage)
    const [pendingDeleteLocale, setPendingDeleteLocale] = useState<OptionItem>()
    const [pendingCloseArticle, setPendingCloseArticle] = useState(false)
    const [fullscreenEditModal, setFullscreenEditModal] = useState(false)
    const [isArticleLoading, setIsArticleLoading] = useState(false)
    const [counters, setCounters] = useState<{
        charCount: number
        wordCount: number
    }>()
    const [isEditorCodeViewActive, setIsEditorCodeViewActive] = useState(false)
    const limitations = useLimitations()
    const {client} = useHelpCenterApi()
    const {helpCenter, getHelpCenterCustomDomain} = useCurrentHelpCenter()
    const articlesActions = useArticlesActions()
    const categoryModal = useModalManager(MODALS.CATEGORY, {autoDestroy: false})
    const articleModal = useModalManager(MODALS.ARTICLE, {autoDestroy: false})

    const screenSize = useScreenSize()

    useEffect(() => {
        articleModal.on(MODALS.ARTICLE, Event.afterOpen, createArticle)
        dispatch(resetCategories())
        dispatch(resetArticles())
    }, [])

    useEffect(() => {
        void getHelpCenterCustomDomain()
    }, [helpCenter !== null])

    // Make sure to exit fullscreen mode when modal view changes
    useEffect(() => {
        if (fullscreenEditModal) {
            setFullscreenEditModal(false)
        }
    }, [editModal])

    useEffect(() => {
        if (selectedArticle?.translation) {
            setArticleLanguage(selectedArticle.translation.locale)
        }
    }, [selectedArticle])

    // Fetch article's translations when opening an article
    useEffect(() => {
        async function updateSelectedArticleTranslations() {
            if (
                !client ||
                !helpCenter?.id ||
                !isExistingArticle(selectedArticle) ||
                isArticleLoading ||
                selectedArticleTranslations
            ) {
                return
            }

            try {
                setIsArticleLoading(true)

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

                setSavedTranslation(translation || null)
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch article translations',
                        status: NotificationStatus.Error,
                    })
                )
                reportError(err as Error)
            } finally {
                setIsArticleLoading(false)
            }
        }

        void updateSelectedArticleTranslations()
    }, [
        client,
        helpCenter,
        viewLanguage,
        selectedArticle,
        selectedArticleTranslations,
        isArticleLoading,
        dispatch,
    ])

    const handleOnArticleModalClose = () => {
        articleModal.closeModal()
        setArticleLanguage(viewLanguage)
        setPendingDeleteLocale(undefined)
        setEditModal((prevState) => ({
            ...prevState,
            opened: false,
        }))
    }

    const handleOnClickAction = (action: ActionType, option: OptionItem) => {
        if (action === 'delete') {
            setPendingDeleteLocale(option)
        } else {
            switchArticleTranslation(option.value)
        }
    }

    const handleOnConfirmDeleteLocale = () => {
        if (isExistingArticle(selectedArticle) && pendingDeleteLocale) {
            void articlesActions.deleteArticleTranslation(
                selectedArticle.id,
                pendingDeleteLocale.value
            )
        }
        handleOnArticleModalClose()
    }

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

        if (!savedTranslation) {
            return {
                canSaveArticle: filledRequired,
                requiredFieldsArticle,
            }
        }

        const translationHasBeenChanged = !_isEqual(
            currentTranslation,
            savedTranslation
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
        savedTranslation,
        selectedCategoryId,
        isEditorCodeViewActive,
    ])

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

    const getEditModalContent = () => {
        if (!selectedArticle?.translation || !helpCenter) {
            return null
        }

        const helpCenterDomain = getHelpCenterDomain(helpCenter)
        const articleLocales = isExistingArticle(selectedArticle)
            ? selectedArticle.available_locales
            : undefined

        switch (editModal.content) {
            case HelpCenterModalContent.ARTICLE:
                return (
                    <span
                        className={css.modalForm}
                        id={EDITOR_MODAL_CONTAINER_ID}
                    >
                        <HelpCenterEditModalHeader
                            title={selectedArticle.translation.title}
                            helpCenter={helpCenter}
                            isFullscreen={fullscreenEditModal}
                            articleLocales={articleLocales}
                            supportedLocales={helpCenter.supported_locales}
                            onChangeLanguage={switchArticleTranslation}
                            onClose={handleOnArticleModalClose}
                            onResize={
                                screenSize !== SCREEN_SIZE.SMALL
                                    ? () =>
                                          setFullscreenEditModal(
                                              !fullscreenEditModal
                                          )
                                    : undefined
                            }
                            language={articleLanguage}
                            onEditTitle={(title: string) =>
                                setSelectedArticle(
                                    (prevSelectedArticle) =>
                                        (prevSelectedArticle?.translation && {
                                            ...prevSelectedArticle,
                                            translation: {
                                                ...prevSelectedArticle.translation,
                                                title,
                                                slug: slugify(title),
                                            },
                                        }) ||
                                        null
                                )
                            }
                            selectedCategoryId={selectedCategoryId}
                            onEditCategory={setSelectedCategoryId}
                            onClickAction={handleOnClickAction}
                            toggleModalBtn={
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditModal({
                                            opened: true,
                                            content:
                                                HelpCenterModalContent.ARTICLE_ADVANCED,
                                        })
                                    }
                                    className={css.toggleModalBtn}
                                >
                                    <i className="material-icons">settings</i>
                                </button>
                            }
                        />
                        <HelpCenterEditArticleForm
                            translation={selectedArticle.translation}
                            onChange={onArticleChange}
                            onEditorCodeViewToggle={setIsEditorCodeViewActive}
                        />
                        <HelpCenterEditModalFooter
                            counters={counters}
                            canSave={canSaveArticle}
                            requiredFields={requiredFieldsArticle}
                            canDelete={isExistingArticle(selectedArticle)}
                            onSave={saveArticle}
                            onDelete={deleteArticle}
                        />
                    </span>
                )
            case HelpCenterModalContent.ARTICLE_ADVANCED:
                return (
                    <span className={css.modalForm}>
                        <HelpCenterEditModalHeader
                            helpCenter={helpCenter}
                            language={articleLanguage}
                            articleLocales={articleLocales}
                            supportedLocales={helpCenter.supported_locales}
                            onChangeLanguage={switchArticleTranslation}
                            title="Article Settings"
                            onClose={handleOnArticleModalClose}
                            toggleModalBtn={
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditModal({
                                            opened: true,
                                            content:
                                                HelpCenterModalContent.ARTICLE,
                                        })
                                    }
                                    className={css.toggleModalBtn}
                                >
                                    <i className="material-icons">edit</i>
                                </button>
                            }
                            onClickAction={handleOnClickAction}
                        />
                        <HelpCenterEditAdvancedArticleForm
                            articleId={
                                isExistingArticle(selectedArticle)
                                    ? selectedArticle.id
                                    : undefined
                            }
                            translation={selectedArticle.translation}
                            onChange={(
                                translation: CreateArticleTranslationDto
                            ) =>
                                setSelectedArticle((prevSelectedArticle) =>
                                    prevSelectedArticle
                                        ? {...prevSelectedArticle, translation}
                                        : prevSelectedArticle
                                )
                            }
                            domain={helpCenterDomain}
                        />
                        <HelpCenterEditModalFooter
                            counters={counters}
                            canSave={canSaveArticle}
                            requiredFields={requiredFieldsArticle}
                            canDelete={isExistingArticle(selectedArticle)}
                            onSave={saveArticle}
                            onDelete={deleteArticle}
                        />
                    </span>
                )
            default:
                return null
        }
    }

    const createArticle = () => {
        if (!helpCenter) {
            return
        }

        selectArticle({
            translation: getNewArticleTranslation(articleLanguage),
        })

        const categoryFromModalParams = articleModal.getParams()?.categoryId
        if (categoryFromModalParams !== undefined) {
            setSelectedCategoryId(articleModal.getParams()?.categoryId)
        } else {
            setSelectedCategoryId(null)
        }
    }

    const createCategory = () => {
        categoryModal.openModal(MODALS.CATEGORY, true, {
            isCreate: true,
        })
    }

    const selectArticle = (article: Article | CreateArticleDto) => {
        setSelectedArticleTranslations(null)
        setSelectedArticle(article)
        setEditModal({opened: true, content: HelpCenterModalContent.ARTICLE})
    }

    const editArticleSettings = async (action: string, article: Article) => {
        if (action === 'articleSettings') {
            setSelectedArticleTranslations(null)
            setSelectedArticle(article)
            setEditModal({
                opened: true,
                content: HelpCenterModalContent.ARTICLE_ADVANCED,
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
                            message: 'Successfully copied the link',
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
                        message: 'Duplicated the article with success',
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

    const switchArticleTranslation = (localeCode: LocaleCode) => {
        if (!helpCenter || !selectedArticle) {
            return
        }

        const translation =
            selectedArticleTranslations?.find(
                ({locale: translationLocale}) =>
                    translationLocale === localeCode
            ) || getNewArticleTranslation(localeCode)

        if ('article_id' in translation) {
            setSavedTranslation(translation as ArticleTranslation)
        }

        setSelectedArticle((prevSelectedArticle) =>
            prevSelectedArticle
                ? {...prevSelectedArticle, translation}
                : prevSelectedArticle
        )
        setArticleLanguage(localeCode)
    }

    const saveArticle = async () => {
        if (!helpCenter || !selectedArticle?.translation) {
            return
        }

        // Create or update Article
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
                    message: 'Article successfully saved',
                    status: NotificationStatus.Success,
                })
            )

            setSelectedArticle(null)
            setEditModal((prevState) => ({
                ...prevState,
                opened: false,
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

    const deleteArticle = async () => {
        if (!helpCenter || !isExistingArticle(selectedArticle)) {
            return
        }

        try {
            await articlesActions.deleteArticle(selectedArticle.id)
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Failed to delete the article',
                    status: NotificationStatus.Error,
                })
            )
            console.error(err)
        } finally {
            setSavedTranslation(null)
            setSelectedArticle(null)
            setEditModal((prevState) => ({
                ...prevState,
                opened: false,
            }))
        }
    }

    const handleOnReorder = (categoryId: number, articles: Article[]): void => {
        void articlesActions.updateArticlesPositions(
            articles,
            categoryId >= 0 ? categoryId : undefined
        )
    }

    const handleOnDiscard = () => {
        setEditModal((prevState) => ({
            ...prevState,
            opened: false,
        }))
        setPendingCloseArticle(false)
    }

    const handleOnEdit = () => {
        setPendingCloseArticle(false)
    }

    const handleOnSave = async () => {
        await saveArticle()
        setEditModal((prevState) => ({
            ...prevState,
            opened: false,
        }))
        setPendingCloseArticle(false)
    }

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
                <Button className="mr-2" onClick={createCategory}>
                    Create Category
                </Button>
                <Button
                    color="success"
                    onClick={createArticle}
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
                    createArticle={createArticle}
                    createCategory={createCategory}
                    renderArticleList={(categoryId, articles) => (
                        <ArticlesTable
                            isNested
                            categoryId={categoryId}
                            list={articles}
                            onClick={selectArticle}
                            onReorderFinish={handleOnReorder}
                            onClickSettings={editArticleSettings}
                        />
                    )}
                />

                <CategoryDrawer helpCenter={helpCenter} />
                <HelpCenterEditModal
                    open={editModal.opened}
                    fullscreen={
                        fullscreenEditModal || screenSize === SCREEN_SIZE.SMALL
                    }
                    isLoading={isArticleLoading}
                    portalRootId="app-root"
                    onBackdropClick={() => {
                        if (canSaveArticle || isEditorCodeViewActive) {
                            setPendingCloseArticle(true)
                        } else {
                            setEditModal((prevState) => ({
                                ...prevState,
                                opened: false,
                            }))
                        }
                    }}
                    transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
                >
                    {getEditModalContent()}
                </HelpCenterEditModal>
                {pendingCloseArticle && (
                    <CloseArticleModal
                        isOpen={
                            !!pendingCloseArticle &&
                            (canSaveArticle || isEditorCodeViewActive)
                        }
                        title={<span>Are you sure?</span>}
                        style={{width: '100%', maxWidth: 500}}
                        onDiscard={handleOnDiscard}
                        onContinueEditing={handleOnEdit}
                        {...(canSaveArticle && {onSave: handleOnSave})}
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
                {pendingDeleteLocale && (
                    <ConfirmationModal
                        isOpen={!!pendingDeleteLocale}
                        confirmText={`Delete ${pendingDeleteLocale?.text}`}
                        title={
                            <span>
                                Are you sure you want to delete{' '}
                                {pendingDeleteLocale?.label} for this article?
                            </span>
                        }
                        style={{width: '100%', maxWidth: 610}}
                        onClose={() => setPendingDeleteLocale(undefined)}
                        onConfirm={handleOnConfirmDeleteLocale}
                    >
                        <span>
                            You will lose all content saved and published of
                            this language ({pendingDeleteLocale?.label}) for
                            this article. You can’t undo this action, you’ll
                            have to compose again all the content for this
                            language if you decide to add it.
                        </span>
                    </ConfirmationModal>
                )}
            </SupportedLocalesProvider>
        </div>
    )
}

export default HelpCenterArticlesView
