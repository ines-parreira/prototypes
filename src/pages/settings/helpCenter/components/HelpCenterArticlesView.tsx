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
    HelpCenterLocaleCode,
} from '../../../../models/helpCenter/types'
import {validLocaleCode} from '../../../../models/helpCenter/utils'
import {NotificationStatus} from '../../../../state/notifications/types'
import {
    changeViewLanguage,
    readViewLanguage,
} from '../../../../state/helpCenter/ui'
import {resetArticles} from '../../../../state/helpCenter/articles'
import {resetCategories} from '../../../../state/helpCenter/categories'

import {useModalManager, Event} from '../../../../hooks/useModalManager'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import {MODALS, HELP_CENTER_DOMAIN} from '../constants'

import {
    getNewTranslation,
    articleRequiredFields,
    slugify,
} from '../utils/helpCenter.utils'
import {SCREEN_SIZE, useScreenSize} from '../../../../hooks/useScreenSize'
import {CategoriesViews} from '../providers/CategoriesView'
import {SupportedLocalesProvider} from '../providers/SupportedLocales'
import {CategoryDrawer} from '../providers/CategoryDrawer'
import {useCurrentHelpCenter} from '../hooks/useCurrentHelpCenter'
import {useArticlesActions} from '../hooks/useArticlesActions'
import {useLocales} from '../hooks/useLocales'
import {useArticles} from '../hooks/useArticles'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {useLocaleSelectOptions} from '../hooks/useLocaleSelectOptions'

import {ArticlesTable} from './ArticlesTable'
import CreateFirst from './articles/CreateFirst'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import HelpCenterArticleList from './articles/HelpCenterArticleList'
import HelpCenterEditModal from './articles/HelpCenterEditModal'
import HelpCenterEditArticleForm from './articles/HelpCenterEditArticleForm'
import HelpCenterEditAdvancedArticleForm from './articles/HelpCenterEditAdvancedArticleForm'
import HelpCenterEditModalHeader from './articles/HelpCenterEditModalHeader'
import HelpCenterEditModalFooter from './articles/HelpCenterEditModalFooter'
// import {HelpCenterCategory} from './articles/HelpCenterCategory'

import css from './HelpCenterArticlesView.less'

enum HelpCenterModalContent {
    ARTICLE = 'article',
    ARTICLE_ADVANCED = 'article-advanced',
}

export const HelpCenterArticlesView = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const viewLanguage = useSelector(readViewLanguage)
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
    const [fullscreenEditModal, setFullscreenEditModal] = useState(false)
    const [isArticleLoading, setIsArticleLoading] = useState(false)

    const {isReady, client} = useHelpcenterApi()
    const helpCenter = useCurrentHelpCenter().data
    const articlesActions = useArticlesActions()
    const {articles, isLoading} = useArticles(viewLanguage)

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

    // Fetch article's translations when opening an article
    useEffect(() => {
        async function updateSelectedArticleTranslations() {
            if (
                !selectedArticle?.id ||
                !helpCenter?.id ||
                selectedArticleTranslations ||
                !isReady
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
                        ({locale}) => locale === helpCenter.default_locale
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
    }, [selectedArticle])

    const handleOnArticleModalClose = () => {
        articleModal.closeModal()
        setEditModal(null)
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
                    <form onSubmit={saveArticle} className={css.modalForm}>
                        <HelpCenterEditModalHeader
                            title={selectedArticle.translation.title}
                            isFullscreen={fullscreenEditModal}
                            languageOptions={localeOptions.filter((locale) =>
                                helpCenter?.supported_locales?.includes(
                                    locale.code
                                )
                            )}
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
                            language={
                                selectedArticle.translation.locale ||
                                helpCenter.default_locale
                            }
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
                    </form>
                )
            case HelpCenterModalContent.ARTICLE_ADVANCED:
                return (
                    <form onSubmit={saveArticle} className={css.modalForm}>
                        <HelpCenterEditModalHeader
                            language={
                                selectedArticle.translation.locale ||
                                helpCenter.default_locale
                            }
                            languageOptions={localeOptions.filter((locale) =>
                                helpCenter?.supported_locales?.includes(
                                    locale.code
                                )
                            )}
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
                    </form>
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
            translation: getNewTranslation(helpCenter.default_locale),
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
                        `https://${helpCenter.subdomain}.${HELP_CENTER_DOMAIN}/${article.translation.slug}-${article.id}`
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

    const switchArticleTranslation = (locale: HelpCenterLocaleCode) => {
        if (!helpCenter || !selectedArticle || !selectedArticleTranslations) {
            return
        }

        const translation =
            selectedArticleTranslations.find(
                ({locale: translationLocale}) => translationLocale === locale
            ) || getNewTranslation(locale)
        setSelectedArticle(
            (prevSelectedArticle) =>
                prevSelectedArticle &&
                ({
                    ...prevSelectedArticle,
                    translation,
                } as HelpCenterArticle)
        )
    }

    const saveArticle = async (event?: FormEvent) => {
        event?.preventDefault()

        if (!helpCenter || !selectedArticle || !selectedArticle.translation) {
            return
        }

        // Update Article
        if (selectedArticle.id) {
            try {
                await articlesActions.updateArticleTranslation(selectedArticle)
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
            {isLoading || helpCenter === null ? (
                <Container fluid className="page-container">
                    <Loader />
                </Container>
            ) : (
                <SupportedLocalesProvider>
                    <Container fluid className="page-container">
                        <CreateFirst
                            title="Create your first article 📚"
                            description="Write your first article to be displayed in your very own help
                center."
                            buttonText="Create Article"
                            onClick={createArticle}
                        />
                    </Container>
                    {helpCenter && (
                        <CategoriesViews
                            helpcenter={helpCenter}
                            currentViewLanguage={viewLanguage}
                            renderArticleList={(category) => (
                                <ArticlesTable
                                    isNested
                                    categoryId={category.id}
                                    list={category.articles}
                                    onClick={selectArticle}
                                    onReorderFinish={handleOnReorder}
                                    onClickSettings={editArticleSettings}
                                />
                            )}
                        />
                    )}

                    {articles.length > 0 && (
                        <HelpCenterArticleList
                            label="uncategorised articles"
                            list={articles}
                            onClick={selectArticle}
                            onReorderFinish={handleOnReorder}
                            onClickSettings={editArticleSettings}
                        />
                    )}
                    {helpCenter && <CategoryDrawer helpCenter={helpCenter} />}
                    <HelpCenterEditModal
                        open={Boolean(editModal)}
                        fullscreen={
                            fullscreenEditModal ||
                            screenSize === SCREEN_SIZE.SMALL
                        }
                        isLoading={isArticleLoading}
                        portalRootId="app-root"
                    >
                        {getEditModalContent()}
                    </HelpCenterEditModal>
                </SupportedLocalesProvider>
            )}
        </div>
    )
}

export default HelpCenterArticlesView
