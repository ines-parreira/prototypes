import React, {FormEvent, useEffect, useState, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {Button, Container} from 'reactstrap'
import classnames from 'classnames'
import copy from 'copy-to-clipboard'

import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import SelectField from '../../../common/forms/SelectField/SelectField'
import {notify} from '../../../../state/notifications/actions'
import {
    HelpCenterArticle,
    HelpCenterArticleTranslation,
    LocaleCode,
} from '../../../../models/helpCenter/types'
import {validLocaleCode} from '../../../../models/helpCenter/utils'
import {NotificationStatus} from '../../../../state/notifications/types'
import {
    changeViewLanguage,
    readViewLanguage,
} from '../../../../state/helpCenter/ui'
import {resetArticles} from '../../../../state/helpCenter/articles'
import {resetCategories} from '../../../../state/helpCenter/categories'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'

import {useModalManager, Event} from '../../../../hooks/useModalManager'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import {
    MODALS,
    HELP_CENTER_DOMAIN,
    HELP_CENTER_LANGUAGE_DEFAULT,
} from '../constants'

import {
    getNewTranslation,
    articleRequiredFields,
    slugify,
} from '../utils/helpCenter.utils'
import {SCREEN_SIZE, useScreenSize} from '../../../../hooks/useScreenSize'
import {CategoriesViews} from '../providers/CategoriesView'
import {SupportedLocalesProvider} from '../providers/SupportedLocales'
import {CategoryDrawer} from '../providers/CategoryDrawer'
import {useArticlesActions} from '../hooks/useArticlesActions'
import {useLocales} from '../hooks/useLocales'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {useLocaleSelectOptions} from '../hooks/useLocaleSelectOptions'

import {ArticlesTable} from './ArticlesTable'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import HelpCenterEditModal from './articles/HelpCenterEditModal'
import HelpCenterEditArticleForm from './articles/HelpCenterEditArticleForm'
import HelpCenterEditAdvancedArticleForm from './articles/HelpCenterEditAdvancedArticleForm'
import HelpCenterEditModalHeader from './articles/HelpCenterEditModalHeader'
import HelpCenterEditModalFooter from './articles/HelpCenterEditModalFooter'
import {ActionType, OptionItem} from './articles/ArticleLanguageSelect'

import css from './HelpCenterArticlesView.less'
import {ConfirmationModal} from './ConfirmationModal'

enum HelpCenterModalContent {
    ARTICLE = 'article',
    ARTICLE_ADVANCED = 'article-advanced',
}

export const HelpCenterArticlesView = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const viewLanguage =
        useSelector(readViewLanguage) || HELP_CENTER_LANGUAGE_DEFAULT
    const [editModal, setEditModal] = useState<HelpCenterModalContent | null>(
        null
    )
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
                !selectedArticle?.id ||
                !helpCenter?.id ||
                selectedArticleTranslations ||
                !client
            ) {
                return
            }

            if (client) {
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
                        setSavedTranslation(translation || null)
                    }
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
        }

        void updateSelectedArticleTranslations()
    }, [
        client,
        helpCenter,
        viewLanguage,
        selectedArticle,
        selectedArticleTranslations,
        dispatch,
    ])

    const handleOnArticleModalClose = () => {
        articleModal.closeModal()
        setArticleLanguage(viewLanguage)
        setPendingDeleteLocale(undefined)
        setEditModal(null)
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
        if (!currentTranslation) {
            return false
        }

        const filledRequired = articleRequiredFields.every((key) =>
            Boolean(currentTranslation[key])
        )
        if (!savedTranslation) {
            return filledRequired
        }
        const hasBeenChanged = articleRequiredFields.some(
            (key) => currentTranslation[key] !== savedTranslation[key]
        )
        return filledRequired && hasBeenChanged
    }, [selectedArticle, savedTranslation])

    const getEditModalContent = () => {
        if (!selectedArticle?.translation || !helpCenter) {
            return null
        }
        switch (editModal) {
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
                                        setEditModal(
                                            HelpCenterModalContent.ARTICLE_ADVANCED
                                        )
                                    }
                                    className={css.toggleModalBtn}
                                >
                                    Advanced Settings
                                </button>
                            }
                        />
                        <HelpCenterEditArticleForm
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
                        />
                        <HelpCenterEditModalFooter
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
                                        setEditModal(
                                            HelpCenterModalContent.ARTICLE
                                        )
                                    }
                                    className={css.toggleModalBtn}
                                >
                                    Edit Article
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

    const selectArticle = (article: HelpCenterArticle) => {
        setSelectedArticleTranslations(null)
        setSelectedArticle(article)
        setEditModal(HelpCenterModalContent.ARTICLE)
    }

    const editArticleSettings = async (
        action: string,
        article: HelpCenterArticle
    ) => {
        if (action === 'articleSettings') {
            setSelectedArticleTranslations(null)
            setSelectedArticle(article)
            setEditModal(HelpCenterModalContent.ARTICLE_ADVANCED)
        }

        if (action === 'copyToClipboard') {
            if (article?.translation && helpCenter?.subdomain) {
                try {
                    copy(
                        `https://${helpCenter.subdomain}${HELP_CENTER_DOMAIN}/${article.translation.slug}-${article.id}`
                    )
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
                setEditModal(null)
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
                setEditModal(null)
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
            setSelectedArticle(null)
            setEditModal(null)
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
                <Button
                    className="mr-2"
                    onClick={() =>
                        categoryModal.openModal(MODALS.CATEGORY, true, {
                            isCreate: true,
                        })
                    }
                >
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
                        createArticle={createArticle}
                        helpCenter={helpCenter}
                        viewLanguage={viewLanguage}
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
                        open={Boolean(editModal)}
                        fullscreen={
                            fullscreenEditModal ||
                            screenSize === SCREEN_SIZE.SMALL
                        }
                        isLoading={isArticleLoading}
                        portalRootId="app-root"
                        onBackdropClick={() => setEditModal(null)}
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
