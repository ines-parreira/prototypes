import React, {FormEvent, useEffect, useState, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {Button, Container} from 'reactstrap'
import classnames from 'classnames'
import keyBy from 'lodash/keyBy'

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
    Category,
    CreateArticleInput,
    HelpCenter,
    HelpCenterArticle,
    HelpCenterArticleTranslation,
    HelpCenterLocaleCode,
    UpdateHelpCenterArticleTranslationInput,
} from '../../../../models/helpCenter/types'
import {NotificationStatus} from '../../../../state/notifications/types'
import {
    getHelpCenterClient,
    HelpCenterClient,
} from '../../../../../../../rest_api/help_center_api/index'

import {getLocalesResponseFixture} from '../fixtures/getLocalesResponse.fixtures'
import {getCategoriesResponseEnglish} from '../fixtures/getCategoriesResponse.fixtures'

import {
    getNewTranslation,
    articleRequiredFields,
    slugify,
} from '../utils/helpCenter.utils'
import {SCREEN_SIZE, useScreenSize} from '../../../../hooks/useScreenSize'

import {CategoriesTable} from './CategoriesTable'
import CreateFirst from './articles/CreateFirst'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import HelpCenterArticleList from './articles/HelpCenterArticleList'
import HelpCenterEditModal from './articles/HelpCenterEditModal'
import HelpCenterEditArticleForm from './articles/HelpCenterEditArticleForm'
import HelpCenterEditAdvancedArticleForm from './articles/HelpCenterEditAdvancedArticleForm'
import HelpCenterEditModalHeader from './articles/HelpCenterEditModalHeader'
import HelpCenterEditModalFooter from './articles/HelpCenterEditModalFooter'
import {HelpCenterCategory} from './articles/HelpCenterCategory'

import css from './HelpCenterArticlesView.less'
import {ArticlesTable} from './ArticlesTable'

type Props = RouteComponentProps & ConnectedProps<typeof connector>

enum HelpCenterModalContent {
    ARTICLE = 'article',
    ARTICLE_ADVANCED = 'article-advanced',
}

let helpCenterClient: HelpCenterClient

type DictionaryCategory = {
    [key: number]: Category
}

// TODO: Transform this into a selector once we plug this to the API
function readCategoriesWithArticles(
    categories: Partial<Category>[],
    articles: HelpCenterArticle[]
): DictionaryCategory {
    const output = keyBy(
        categories.map((category) => ({
            ...category,
            articles: [] as HelpCenterArticle[],
        })),
        'id'
    ) as DictionaryCategory

    articles.forEach((article) => {
        if (article.category_id && output[article.category_id]) {
            output[article.category_id].articles.push(article)
        }
    })

    return output
}

export const HelpCenterArticlesView = ({
    articles,
    helpCenterArticleCreated,
    helpCenterArticlesFetched,
    helpCenterArticleUpdated,
    helpCenterArticleDeleted,
    notify,
    match,
}: Props) => {
    const [helpCenter, setHelpCenter] = useState<HelpCenter | null>(null)
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
    const [isCategoryDrawerOpen, setCategoryDrawerOpen] = useState(false)
    const screenSize = useScreenSize()
    const helpCenterId = parseInt(
        (match.params as {helpcenterId: string}).helpcenterId
    )

    useEffect(() => {
        async function init() {
            setIsLoading(true)
            try {
                helpCenterClient = await getHelpCenterClient()
                const {data: helpCenter} = await helpCenterClient.getHelpCenter(
                    {
                        id: helpCenterId,
                    }
                )
                setHelpCenter(helpCenter)
                const {
                    data: {data: articles},
                } = await helpCenterClient.listArticles({
                    help_center_id: helpCenter.id,
                    locale: helpCenter.default_locale,
                })
                helpCenterArticlesFetched(articles)
            } catch (err) {
                void notify({
                    message: 'Failed to retrieve the article list',
                    status: NotificationStatus.Error,
                })
            } finally {
                setIsLoading(false)
            }
        }

        void init()
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
                            languageOptions={localeOptions}
                            onChangeLanguage={switchArticleTranslation}
                            onClose={() => setEditModal(null)}
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
                            languageOptions={localeOptions}
                            onChangeLanguage={switchArticleTranslation}
                            title="Article Settings"
                            onClose={() => setEditModal(null)}
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

    const editArticleSettings = (article: HelpCenterArticle) => {
        setSelectedArticleTranslations(null)
        setSelectedArticle(article)
        setEditModal(HelpCenterModalContent.ARTICLE_ADVANCED)
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
            const createArticleInput: CreateArticleInput = {
                translation: {
                    title: selectedArticle.translation.title,
                    content: selectedArticle.translation.content,
                    excerpt: selectedArticle.translation.excerpt,
                    slug: selectedArticle.translation.slug,
                    locale: selectedArticle.translation.locale,
                },
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
                <Button onClick={() => setCategoryDrawerOpen(true)}>
                    Create Category
                </Button>
            </PageHeader>
            <HelpCenterNavigation helpcenterId={helpCenterId} />
            {isLoading ? (
                <Container fluid className="page-container">
                    <Loader />
                </Container>
            ) : (
                <>
                    <Container fluid className="page-container">
                        <CreateFirst
                            title="Create your first article 📚"
                            description="Write your first article to be displayed in your very own help
                center."
                            buttonText="Create Article"
                            onClick={createArticle}
                        />
                    </Container>
                    <CategoriesTable
                        categories={Object.values(
                            readCategoriesWithArticles(
                                getCategoriesResponseEnglish.data,
                                articleList
                            )
                        )}
                        renderArticleList={(category) => (
                            <ArticlesTable
                                isNested
                                categoryId={category.id}
                                list={category.articles}
                                onClick={selectArticle}
                                onClickSettings={editArticleSettings}
                            />
                        )}
                    />

                    {articleList.length > 0 && (
                        <HelpCenterArticleList
                            label="uncategorised articles"
                            list={articleList.filter(
                                (article) => !article.category_id
                            )}
                            onClick={selectArticle}
                            onClickSettings={editArticleSettings}
                        />
                    )}
                    <HelpCenterCategory
                        helpCenter={helpCenter}
                        isOpen={isCategoryDrawerOpen}
                        getCategory={() =>
                            new Promise((resolve) => {
                                setTimeout(resolve, 500)
                            })
                        }
                        onClose={() => setCategoryDrawerOpen(false)}
                    />
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
                </>
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
