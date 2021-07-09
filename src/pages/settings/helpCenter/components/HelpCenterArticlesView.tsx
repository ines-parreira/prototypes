import React, {FormEvent, useEffect, useState, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {Button, Container} from 'reactstrap'
import classnames from 'classnames'
import copy from 'copy-to-clipboard'
import {chain} from 'lodash'

import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import {RootState} from '../../../../state/types'
import {notify} from '../../../../state/notifications/actions'
import {
    helpCenterArticleCreated,
    helpCenterArticleDeleted,
    helpCenterArticlesFetched,
    helpCenterArticleUpdated,
} from '../../../../state/entities/helpCenterArticles/actions'
import {
    CreateArticleInput,
    HelpCenterArticle,
    HelpCenterArticleTranslation,
    HelpCenterLocaleCode,
    UpdateHelpCenterArticleTranslationInput,
    HelpCenterLocale,
} from '../../../../models/helpCenter/types'
import {NotificationStatus} from '../../../../state/notifications/types'
import {
    getHelpCenterClient,
    HelpCenterClient,
} from '../../../../../../../rest_api/help_center_api/index'

import {useModalManager, Event} from '../../../../hooks/useModalManager'

import {getLocalesResponseFixture} from '../fixtures/getLocalesResponse.fixtures'
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

type Props = RouteComponentProps & ConnectedProps<typeof connector>

enum HelpCenterModalContent {
    ARTICLE = 'article',
    ARTICLE_ADVANCED = 'article-advanced',
}

let helpCenterClient: HelpCenterClient

export const HelpCenterArticlesView = ({
    articles,
    helpCenterArticleCreated,
    helpCenterArticlesFetched,
    helpCenterArticleUpdated,
    helpCenterArticleDeleted,
    notify,
    match,
}: Props) => {
    const helpCenterId = parseInt(
        (match.params as {helpcenterId: string}).helpcenterId
    )
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
    const [localeOptions] = useState(getLocalesResponseFixture)
    const [fullscreenEditModal, setFullscreenEditModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isArticleLoading, setIsArticleLoading] = useState(false)

    const helpCenter = useCurrentHelpCenter(helpCenterId).data
    const categoryModal = useModalManager(MODALS.CATEGORY)
    const articleModal = useModalManager(MODALS.ARTICLE)

    const screenSize = useScreenSize()

    useEffect(() => {
        articleModal.on(MODALS.ARTICLE, Event.afterOpen, createArticle)
    }, [])

    useEffect(() => {
        async function init() {
            setIsLoading(true)
            try {
                helpCenterClient = await getHelpCenterClient()
                if (helpCenter) {
                    const {
                        data: {data: articles},
                    } = await helpCenterClient.listArticles({
                        help_center_id: helpCenter.id,
                        locale: helpCenter.default_locale,
                        has_category: false,
                    })
                    helpCenterArticlesFetched(articles)
                }
            } catch (err) {
                void notify({
                    message: 'Failed to retrieve the article list',
                    status: NotificationStatus.Error,
                })
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        void init()
    }, [helpCenter])

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
                selectedArticleTranslations
            ) {
                return
            }

            try {
                setIsArticleLoading(true)
                const {
                    data: {data: translations},
                } = await helpCenterClient.listArticleTranslations({
                    help_center_id: helpCenter.id,
                    article_id: selectedArticle.id,
                })
                const translation = translations.find(
                    ({locale}) => locale === helpCenter.default_locale
                )
                setSelectedArticleTranslations(translations)
                setSelectedArticle({
                    ...selectedArticle,
                    translation,
                })
                setSavedTranslation(translation || null)
            } catch (err) {
                void notify({
                    message: 'Failed to fetch article translations',
                    status: NotificationStatus.Error,
                })
            } finally {
                setIsArticleLoading(false)
            }
        }

        void updateSelectedArticleTranslations()
    }, [selectedArticle])

    const handleOnArticleModalClose = () => {
        articleModal.closeModal()
        setEditModal(null)
    }

    const articleList = useMemo(
        () =>
            Object.values(articles).sort(
                (
                    {created_datetime: createdDate1},
                    {created_datetime: createdDate2}
                ) => {
                    if (
                        new Date(createdDate1).getTime() >
                        new Date(createdDate2).getTime()
                    ) {
                        return -1
                    }
                    return 1
                }
            ),
        [articles]
    )

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
                            languageOptions={
                                localeOptions as HelpCenterLocale[]
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
                            languageOptions={
                                localeOptions as HelpCenterLocale[]
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
                        `https://${helpCenter.subdomain}.${HELP_CENTER_DOMAIN}/${article.translation.slug}`
                    )
                    void notify({
                        message: 'Successfully copied the link',
                        status: NotificationStatus.Success,
                    })
                } catch (err) {
                    void notify({
                        message: 'Failed to copy the link',
                        status: NotificationStatus.Error,
                    })
                    console.error(err)
                }
            }
            return
        }

        if (action === 'duplicateArticle') {
            if (!article.translation) {
                void notify({
                    message: 'Failed to duplicate the article',
                    status: NotificationStatus.Error,
                })
                return
            }

            const payload: CreateArticleInput = {
                translation: {
                    locale: article.translation?.locale,
                    content: article.translation.content || '',
                    excerpt: article.translation.excerpt,
                    slug: `${article.translation.slug}-1`,
                    title: `${
                        article.translation
                            ? article.translation?.title
                            : 'Untitled'
                    } (1)`,
                },
            }

            if ((article?.category_id as number) >= 0) {
                payload['category_id'] = article.category_id
            }

            try {
                const translations = await helpCenterClient
                    .listArticleTranslations({
                        help_center_id: helpCenterId,
                        article_id: article.id,
                    })
                    .then((response) => response.data.data)

                const duplicateArticle = await helpCenterClient
                    .createArticle(
                        {
                            help_center_id: helpCenterId,
                        },
                        payload
                    )
                    .then((response) => response.data)

                await Promise.all(
                    translations.map((translation) =>
                        helpCenterClient.updateArticleTranslation(
                            {
                                help_center_id: helpCenterId,
                                article_id: duplicateArticle.id,
                                locale: translation.locale,
                            },
                            {
                                title: `${translation.title} (1)`,
                                excerpt: translation.excerpt,
                                content: translation.content,
                                slug: `${translation.slug}-1`,
                            }
                        )
                    )
                )
                void notify({
                    message: 'Duplicated the article with success',
                    status: NotificationStatus.Success,
                })
            } catch (err) {
                void notify({
                    message: 'Failed to duplicate the article',
                    status: NotificationStatus.Error,
                })
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
            const updateArticleInput: UpdateHelpCenterArticleTranslationInput = {
                title: selectedArticle.translation.title,
                content: selectedArticle.translation.content,
                excerpt: selectedArticle.translation.excerpt,
                slug: selectedArticle.translation.slug,
            }
            try {
                const {
                    data: updatedTranslation,
                } = await helpCenterClient.updateArticleTranslation(
                    {
                        help_center_id: helpCenter.id,
                        article_id: selectedArticle.id,
                        locale: selectedArticle.translation.locale,
                    },
                    updateArticleInput
                )
                const updatedArticle = {
                    ...selectedArticle,
                    translation: updatedTranslation,
                }
                setSelectedArticle(updatedArticle)
                setSavedTranslation(updatedTranslation || null)
                helpCenterArticleUpdated(updatedArticle)
                void notify({
                    message: 'Article successfully saved',
                    status: NotificationStatus.Success,
                })
            } catch (err) {
                void notify({
                    message: 'Failed to save the article',
                    status: NotificationStatus.Error,
                })
            }
        }
        // Create Article
        else {
            const articleModalParams = articleModal.getParams()

            const createArticleInput: CreateArticleInput = {
                translation: {
                    title: selectedArticle.translation.title,
                    content: selectedArticle.translation.content,
                    excerpt: selectedArticle.translation.excerpt,
                    slug: selectedArticle.translation.slug,
                    locale: selectedArticle.translation.locale,
                },
            }

            if (articleModalParams && articleModalParams?.categoryId >= 0) {
                createArticleInput['category_id'] =
                    articleModalParams.categoryId
            }

            try {
                const {
                    data: createdArticle,
                } = await helpCenterClient.createArticle(
                    {
                        help_center_id: helpCenter.id,
                    },
                    createArticleInput
                )
                setSelectedArticle(createdArticle)
                setSavedTranslation(createdArticle.translation || null)
                helpCenterArticleCreated(createdArticle)
                void notify({
                    message: 'Article successfully created',
                    status: NotificationStatus.Success,
                })
            } catch (err) {
                void notify({
                    message: 'Failed to create the article',
                    status: NotificationStatus.Error,
                })
            }
        }
    }

    const deleteArticle = async () => {
        if (!helpCenter || !selectedArticle) {
            return
        }

        try {
            await helpCenterClient.deleteArticle({
                help_center_id: helpCenter.id,
                id: selectedArticle.id,
            })
            setSelectedArticle(null)
            setEditModal(null)
            helpCenterArticleDeleted(selectedArticle.id)
        } catch (err) {
            void notify({
                message: 'Failed to delete the article',
                status: NotificationStatus.Error,
            })
        }
    }

    const handleOnReorder = (
        categoryId: number,
        articles: HelpCenterArticle[]
    ): void => {
        if (helpCenterClient && helpCenter) {
            const sortedArticles = chain(articles)
                .sortBy(['position'])
                .map((article) => article.id)
                .value()

            if (categoryId >= 0) {
                void helpCenterClient.setArticlesPositionsInCategory(
                    {
                        help_center_id: helpCenter.id,
                        category_id: categoryId,
                    },
                    sortedArticles
                )
            } else {
                void helpCenterClient.setUncategorizedArticlesPositions(
                    {
                        help_center_id: helpCenter.id,
                    },
                    sortedArticles
                )
            }
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
            {isLoading && helpCenter === null ? (
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

                    {articleList.length > 0 && (
                        <HelpCenterArticleList
                            label="uncategorised articles"
                            list={articleList}
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

const connector = connect(
    (state: RootState) => ({
        articles: state.entities.helpCenterArticles,
    }),
    {
        helpCenterArticleCreated,
        helpCenterArticlesFetched,
        helpCenterArticleUpdated,
        helpCenterArticleDeleted,
        notify,
    }
)

export default withRouter(connector(HelpCenterArticlesView))
