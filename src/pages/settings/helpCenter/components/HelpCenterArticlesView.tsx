import React, {FormEvent, useEffect, useMemo, useState} from 'react'
import classnames from 'classnames'
import copy from 'copy-to-clipboard'
import {useSelector} from 'react-redux'
import {Button, Container} from 'reactstrap'

import {
    HelpCenterArticle,
    HelpCenterArticleTranslation,
    LocaleCode,
} from '../../../../models/helpCenter/types'
import {getViewLanguage} from '../../../../state/helpCenter/ui'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import {resetArticles} from '../../../../state/helpCenter/articles'
import {resetCategories} from '../../../../state/helpCenter/categories'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'

import {useModalManager, Event} from '../../../../hooks/useModalManager'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import {
    MODALS,
    HELP_CENTER_LANGUAGE_DEFAULT,
    DRAWER_TRANSITION_DURATION_MS,
    EDITOR_MODAL_CONTAINER_ID,
} from '../constants'

import {SCREEN_SIZE, useScreenSize} from '../../../../hooks/useScreenSize'
import {useArticlesActions} from '../hooks/useArticlesActions'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {CategoriesViews} from '../providers/CategoriesView'
import {CategoryDrawer} from '../providers/CategoryDrawer'
import {SupportedLocalesProvider} from '../providers/SupportedLocales'
import {
    articleOptionalFields,
    articleRequiredFields,
    buildArticleSlug,
    getHelpCenterDomain,
    getNewTranslation,
    slugify,
} from '../utils/helpCenter.utils'
import {useLimitations} from '../../../../hooks/helpCenter/useLimitations'
import {reportError} from '../../../../utils/errors'

import {ActionType, OptionItem} from './articles/ArticleLanguageSelect'
import HelpCenterEditAdvancedArticleForm from './articles/HelpCenterEditAdvancedArticleForm'
import HelpCenterEditArticleForm from './articles/HelpCenterEditArticleForm'
import HelpCenterEditModal from './articles/HelpCenterEditModal'
import HelpCenterEditModalFooter from './articles/HelpCenterEditModalFooter'
import HelpCenterEditModalHeader from './articles/HelpCenterEditModalHeader'
import {ArticlesTable} from './ArticlesTable'
import {ConfirmationModal} from './ConfirmationModal'
import css from './HelpCenterArticlesView.less'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {CloseArticleModal} from './articles/CloseArticleModal'
import MaxArticleBanner from './Paywalls/MaxArticleBanner'

type HelpCenterModalState = {
    opened: boolean
    content: HelpCenterModalContent | null
}

enum HelpCenterModalContent {
    ARTICLE = 'article',
    ARTICLE_ADVANCED = 'article-advanced',
}

export const HelpCenterArticlesView = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_LANGUAGE_DEFAULT
    const [editModal, setEditModal] = useState<HelpCenterModalState>({
        opened: false,
        content: null,
    })
    const [
        selectedArticle,
        setSelectedArticle,
    ] = useState<HelpCenterArticle | null>(null)
    const [
        savedTranslation,
        setSavedTranslation,
    ] = useState<HelpCenterArticleTranslation | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null
    )
    const [
        selectedArticleTranslations,
        setSelectedArticleTranslations,
    ] = useState<HelpCenterArticleTranslation[] | null>(null)
    const [articleLanguage, setArticleLanguage] = useState(viewLanguage)
    const [pendingDeleteLocale, setPendingDeleteLocale] = useState<OptionItem>()
    const [pendingCloseArticle, setPendingCloseArticle] = useState(false)
    const [fullscreenEditModal, setFullscreenEditModal] = useState(false)
    const [isArticleLoading, setIsArticleLoading] = useState(false)
    const [counters, setCounters] = useState<{
        charCount: number
        wordCount: number
    }>()
    const [customDomain, setCustomDomain] = useState<string | undefined>()
    const limitations = useLimitations()
    const {client} = useHelpcenterApi()
    const helpCenter = useSelector(getCurrentHelpCenter)
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
        async function getCustomDomain() {
            if (client && helpCenterId) {
                const {
                    data: {data: customDomains},
                } = await client.listCustomDomains({
                    help_center_id: helpCenterId,
                })

                setCustomDomain(
                    customDomains.find((domain) => domain.status === 'active')
                        ?.hostname
                )
            }
        }

        void getCustomDomain()
    }, [client, helpCenterId])

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
                !selectedArticle?.id ||
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
                const firstSupportedLanguage = () =>
                    translations.find(({locale}) =>
                        (helpCenter?.supported_locales || []).includes(locale)
                    )

                const translation =
                    translations?.find(({locale}) => locale === viewLanguage) ||
                    firstSupportedLanguage()

                if (translation) {
                    setSelectedArticleTranslations(translations)
                    setSelectedArticle({
                        ...selectedArticle,
                        translation,
                    })
                }
                if (selectedArticle.category_id !== undefined) {
                    setSelectedCategory(selectedArticle.category_id)
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

    const handleOnClickAction = (
        ev: React.MouseEvent,
        action: ActionType,
        option: OptionItem
    ) => {
        if (action === 'delete') {
            ev.stopPropagation()
            setPendingDeleteLocale(option)
        }
    }

    const handleOnConfirmDeleteLocale = () => {
        if (selectedArticle && pendingDeleteLocale) {
            void articlesActions.deleteArticleTranslation(
                selectedArticle.id,
                pendingDeleteLocale.value
            )
        }
        handleOnArticleModalClose()
    }

    const canSaveArticle: boolean = useMemo(() => {
        const currentTranslation = selectedArticle?.translation

        if (articlesActions.isLoading || !currentTranslation) {
            return false
        }

        const filledRequired = articleRequiredFields.every((key) =>
            Boolean(currentTranslation[key])
        )
        if (!savedTranslation) {
            return filledRequired
        }
        const translationHasBeenChanged = articleRequiredFields
            .concat(articleOptionalFields)
            .some((key) => currentTranslation[key] !== savedTranslation[key])
        const categoryHasBeenChanged =
            selectedArticle?.category_id !== selectedCategory

        return (
            filledRequired &&
            (categoryHasBeenChanged || translationHasBeenChanged)
        )
    }, [
        articlesActions.isLoading,
        selectedArticle,
        savedTranslation,
        selectedCategory,
    ])

    const onArticleChange = React.useCallback(
        (translation: HelpCenterArticleTranslation, counters) => {
            setCounters(counters)
            setSelectedArticle(
                (prevSelectedArticle) =>
                    prevSelectedArticle && {
                        ...prevSelectedArticle,
                        translation: {
                            ...prevSelectedArticle.translation,
                            content: translation.content,
                        },
                    }
            )
        },
        []
    )

    const getEditModalContent = () => {
        if (!selectedArticle?.translation || !helpCenter) {
            return null
        }

        const helpCenterDomain = getHelpCenterDomain(
            helpCenter.subdomain,
            customDomain
        )

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
                            selectedArticle={selectedArticle}
                            supportedLocales={
                                helpCenter?.supported_locales || []
                            }
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
                            selectedCategory={selectedCategory}
                            onEditCategory={(categoryId: number | null) => {
                                setSelectedCategory(categoryId)
                            }}
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
                        />
                        <HelpCenterEditModalFooter
                            counters={counters}
                            canSave={canSaveArticle}
                            canDelete={!!selectedArticle.id}
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
                            selectedArticle={selectedArticle}
                            supportedLocales={
                                helpCenter?.supported_locales || []
                            }
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
                            articleId={selectedArticle.id}
                            translation={selectedArticle.translation}
                            onChange={(
                                translation: HelpCenterArticleTranslation
                            ) =>
                                setSelectedArticle(
                                    (prevSelectedArticle) =>
                                        prevSelectedArticle && {
                                            ...prevSelectedArticle,
                                            translation,
                                        }
                                )
                            }
                            helpCenterDomain={helpCenterDomain}
                        />
                        <HelpCenterEditModalFooter
                            counters={counters}
                            canSave={canSaveArticle}
                            canDelete={!!selectedArticle.id}
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
            translation: getNewTranslation(articleLanguage),
        } as HelpCenterArticle)

        const categoryFromModalParams = articleModal.getParams()?.categoryId
        if (categoryFromModalParams !== undefined) {
            setSelectedCategory(articleModal.getParams()?.categoryId)
        } else {
            setSelectedCategory(null)
        }
    }

    const createCategory = () => {
        categoryModal.openModal(MODALS.CATEGORY, true, {
            isCreate: true,
        })
    }

    const selectArticle = (article: HelpCenterArticle) => {
        setSelectedArticleTranslations(null)
        setSelectedArticle(article)
        setEditModal({opened: true, content: HelpCenterModalContent.ARTICLE})
    }

    const editArticleSettings = async (
        action: string,
        article: HelpCenterArticle
    ) => {
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
                const {subdomain} = helpCenter

                const domain = getHelpCenterDomain(subdomain, customDomain)

                try {
                    copy(buildArticleSlug({domain, locale, slug, articleId}))

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
            if (!article.translation) {
                void dispatch(
                    notify({
                        message: 'Failed to duplicate the article',
                        status: NotificationStatus.Error,
                    })
                )
                return
            }

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

    const switchArticleTranslation = (
        ev: React.MouseEvent,
        value: LocaleCode
    ) => {
        if (!helpCenter || !selectedArticle) {
            return
        }

        const translation =
            selectedArticleTranslations?.find(
                ({locale: translationLocale}) => translationLocale === value
            ) || getNewTranslation(value)

        if ((translation as HelpCenterArticleTranslation).article_id) {
            setSavedTranslation(translation as HelpCenterArticleTranslation)
        }

        setSelectedArticle(
            (prevSelectedArticle) =>
                prevSelectedArticle &&
                ({
                    ...prevSelectedArticle,
                    translation,
                } as HelpCenterArticle)
        )
        setArticleLanguage(value)
    }

    const saveArticle = async (event?: FormEvent) => {
        event?.preventDefault()

        if (!helpCenter || !selectedArticle || !selectedArticle.translation) {
            return
        }

        // Update Article
        if (selectedArticle.id) {
            try {
                await articlesActions.updateArticle(
                    selectedArticle,
                    selectedCategory
                )

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
                void dispatch(
                    notify({
                        message: 'Failed to save the article',
                        status: NotificationStatus.Error,
                    })
                )
                console.error(err)
            }
        }
        // Create Article
        else {
            try {
                await articlesActions.createArticle(
                    selectedArticle.translation,
                    selectedCategory
                )

                void dispatch(
                    notify({
                        message: 'Article successfully created',
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
                void dispatch(
                    notify({
                        message: 'Failed to create the article',
                        status: NotificationStatus.Error,
                    })
                )
                console.error(err)
            }
        }
    }

    const deleteArticle = async () => {
        if (!helpCenter || !selectedArticle) {
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

    const handleOnReorder = (
        categoryId: number,
        articles: HelpCenterArticle[]
    ): void => {
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

    return (
        <div className={classnames('full-width', css.wrapper)}>
            <PageHeader
                title={
                    helpCenter && (
                        <HelpCenterDetailsBreadcrumb
                            helpcenterName={helpCenter.name}
                            activeLabel="Articles"
                        />
                    )
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
            <HelpCenterNavigation helpcenterId={helpCenterId} />
            {!helpCenter ? (
                <Container fluid className="page-container">
                    <Loader />
                </Container>
            ) : (
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

                    <CategoryDrawer
                        helpCenter={helpCenter}
                        customDomain={customDomain}
                    />
                    <HelpCenterEditModal
                        open={editModal.opened}
                        fullscreen={
                            fullscreenEditModal ||
                            screenSize === SCREEN_SIZE.SMALL
                        }
                        isLoading={isArticleLoading}
                        portalRootId="app-root"
                        onBackdropClick={() => {
                            if (canSaveArticle) {
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
                            isOpen={!!pendingCloseArticle && canSaveArticle}
                            title={<span>Are you sure?</span>}
                            style={{width: '100%', maxWidth: 500}}
                            onDiscard={handleOnDiscard}
                            onContinueEditing={handleOnEdit}
                            onSave={handleOnSave}
                        >
                            <span>
                                If you close this article, you'll lose all
                                changes made. Do you want to save them?
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
                                    {pendingDeleteLocale?.label} for this
                                    article?
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
            )}
        </div>
    )
}

export default HelpCenterArticlesView
