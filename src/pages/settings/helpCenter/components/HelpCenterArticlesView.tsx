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
import {validLocaleCode} from '../../../../models/helpCenter/utils'
import {
    changeViewLanguage,
    getViewLanguage,
} from '../../../../state/helpCenter/ui'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import SelectField from '../../../common/forms/SelectField/SelectField'
import {resetArticles} from '../../../../state/helpCenter/articles'
import {resetCategories} from '../../../../state/helpCenter/categories'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'

import {useModalManager, Event} from '../../../../hooks/useModalManager'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import {
    MODALS,
    HELP_CENTER_LANGUAGE_DEFAULT,
    DRAWER_TRANSITION_DURATION_MS,
} from '../constants'

import {SCREEN_SIZE, useScreenSize} from '../../../../hooks/useScreenSize'
import {useArticlesActions} from '../hooks/useArticlesActions'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {useLocales} from '../hooks/useLocales'
import {useLocaleSelectOptions} from '../hooks/useLocaleSelectOptions'
import {CategoriesViews} from '../providers/CategoriesView'
import {CategoryDrawer} from '../providers/CategoryDrawer'
import {SupportedLocalesProvider} from '../providers/SupportedLocales'
import {
    articleOptionalFields,
    articleRequiredFields,
    buildArticleSlug,
    getNewTranslation,
    slugify,
} from '../utils/helpCenter.utils'

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
    const [
        selectedArticleTranslations,
        setSelectedArticleTranslations,
    ] = useState<HelpCenterArticleTranslation[] | null>(null)
    const localeOptions = useLocales()
    const [articleLanguage, setArticleLanguage] = useState(viewLanguage)
    const [pendingDeleteLocale, setPendingDeleteLocale] = useState<OptionItem>()
    const [fullscreenEditModal, setFullscreenEditModal] = useState(false)
    const [isArticleLoading, setIsArticleLoading] = useState(false)
    const [counters, setCounters] = useState<{
        charCount: number
        wordCount: number
    }>()

    const {client} = useHelpcenterApi()
    const helpCenter = useSelector(getCurrentHelpCenter)
    const articlesActions = useArticlesActions()

    const categoryModal = useModalManager(MODALS.CATEGORY, {autoDestroy: false})
    const articleModal = useModalManager(MODALS.ARTICLE, {autoDestroy: false})

    const screenSize = useScreenSize()

    const supportedLanguages = useLocaleSelectOptions(
        localeOptions,
        helpCenter?.supported_locales || []
    )

    useEffect(() => {
        articleModal.on(MODALS.ARTICLE, Event.afterOpen, createArticle)
        dispatch(resetCategories())
        dispatch(resetArticles())
    }, [])

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
                const translation = translations.find(
                    ({locale}) => locale === viewLanguage
                )
                if (translation) {
                    setSelectedArticleTranslations(translations)
                    setSelectedArticle({
                        ...selectedArticle,
                        translation,
                    })
                }
                setSavedTranslation(translation || null)
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch article translations',
                        status: NotificationStatus.Error,
                    })
                )
                console.error(err)
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
        const hasBeenChanged = articleRequiredFields
            .concat(articleOptionalFields)
            .some((key) => currentTranslation[key] !== savedTranslation[key])
        return filledRequired && hasBeenChanged
    }, [articlesActions.isLoading, selectedArticle, savedTranslation])

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
        switch (editModal.content) {
            case HelpCenterModalContent.ARTICLE:
                return (
                    <span className={css.modalForm}>
                        <HelpCenterEditModalHeader
                            title={selectedArticle.translation.title}
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
                            onSave={saveArticle}
                            onDelete={deleteArticle}
                        />
                    </span>
                )
            case HelpCenterModalContent.ARTICLE_ADVANCED:
                return (
                    <span className={css.modalForm}>
                        <HelpCenterEditModalHeader
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
                            subdomain={helpCenter.subdomain}
                        />
                        <HelpCenterEditModalFooter
                            counters={counters}
                            canSave={canSaveArticle}
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
                const {locale, slug} = article.translation
                const {subdomain} = helpCenter

                try {
                    copy(buildArticleSlug(subdomain, locale, slug, article.id))

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
        if (!helpCenter || !selectedArticle || !selectedArticleTranslations) {
            return
        }

        const translation =
            selectedArticleTranslations.find(
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

        const localeIsAvailable =
            selectedArticle?.available_locales?.includes(
                selectedArticle?.translation?.locale
            ) || false

        // Update Article
        if (selectedArticle.id) {
            try {
                if (localeIsAvailable) {
                    await articlesActions.updateArticleTranslation(
                        selectedArticle
                    )
                } else {
                    await articlesActions.createArticleTranslation(
                        selectedArticle
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
            const articleModalParams = articleModal.getParams()

            try {
                if (articleModalParams && articleModalParams?.categoryId >= 0) {
                    await articlesActions.createArticleInCategory(
                        selectedArticle.translation,
                        articleModalParams.categoryId
                    )
                } else {
                    await articlesActions.createArticle(
                        selectedArticle.translation
                    )
                }
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
        if (categoryId >= 0) {
            void articlesActions.updateArticlePositionInCategory(
                articles,
                categoryId
            )
        } else {
            void articlesActions.updateUncategorizedArticlePosition(articles)
        }
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
                <SelectField
                    className="mr-4"
                    options={supportedLanguages}
                    value={viewLanguage}
                    onChange={(value) =>
                        dispatch(changeViewLanguage(validLocaleCode(value)))
                    }
                    style={{display: 'inline-block'}}
                />
                <Button className="mr-2" onClick={createCategory}>
                    Create Category
                </Button>
                <Button color="success" onClick={createArticle}>
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
                    <CategoriesViews
                        helpCenter={helpCenter}
                        viewLanguage={viewLanguage}
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
                            fullscreenEditModal ||
                            screenSize === SCREEN_SIZE.SMALL
                        }
                        isLoading={isArticleLoading}
                        portalRootId="app-root"
                        onBackdropClick={() =>
                            setEditModal((prevState) => ({
                                ...prevState,
                                opened: false,
                            }))
                        }
                        transitionDurationMs={DRAWER_TRANSITION_DURATION_MS}
                    >
                        {getEditModalContent()}
                    </HelpCenterEditModal>
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
