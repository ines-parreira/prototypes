import {useCallback, useEffect, useState} from 'react'
import {filter, flatMap, map, mapValues} from 'lodash'
import {
    ArticleTemplateType,
    HelpCenter,
    HelpCenterArticleItem,
    LocalArticleTranslation,
} from 'models/helpCenter/types'
import {useEditionManager} from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {DEFAULT_ARTICLE_GROUP} from 'pages/settings/helpCenter/constants'
import {useCreateArticleUsingTemplate} from 'pages/settings/helpCenter/hooks/useCreateArticleUsingTemplate'
import {useCreateArticleTranslationUsingTemplate} from 'pages/settings/helpCenter/hooks/useCreateArticleTranslationUsingTemplate'
import {useUpdateArticleTranslationUsingTemplate} from 'pages/settings/helpCenter/hooks/useUpdateArticleTranslationUsingTemplate'
import useAppDispatch from 'hooks/useAppDispatch'
import {ArticleOrigin} from 'pages/settings/helpCenter/types/articleOrigin.enum'
import {
    findArticleByKey,
    handleOnError,
    handleOnSuccess,
} from '../HelpCenterCreationWizardUtils'
import {logEvent, SegmentEvent} from '../../../../../../common/segment'

type HelpCenterArticlesFormOutput = {
    articles: Record<string, HelpCenterArticleItem[]>
    selectedArticle: HelpCenterArticleItem | null
    hoveredArticle: HelpCenterArticleItem | null
    isLoading: boolean

    handleArticleHover: (key: string | undefined) => void
    handleArticleSelect: (key: string) => void
    handleArticleEdit: (key: string) => void

    handleEditorClose: () => void
    handleEditorReady: (content: string) => void
    handleEditorSave: (title: string, content: string) => void

    handleNavigationSave: () => Promise<void>
}
export const useHelpCenterArticlesForm = (
    helpCenter: HelpCenter,
    articles: Record<string, HelpCenterArticleItem[]>,
    origin?: ArticleOrigin
): HelpCenterArticlesFormOutput => {
    const [newArticles, setArticles] = useState<
        Record<string, HelpCenterArticleItem[]>
    >(DEFAULT_ARTICLE_GROUP)

    const [selectedArticle, setSelectedArticle] =
        useState<HelpCenterArticleItem | null>(null)

    const [hoveredArticle, setHoveredArticle] =
        useState<HelpCenterArticleItem | null>(null)

    const {setEditModal} = useEditionManager()

    const dispatch = useAppDispatch()

    useEffect(() => {
        setArticles(articles)
    }, [articles])

    const updateArticleItemByKey = (
        key: string,
        article: HelpCenterArticleItem,
        customPayload?: Partial<HelpCenterArticleItem>
    ) => {
        if (article.key !== key) {
            return article
        }

        return {
            ...article,
            ...customPayload,
        }
    }

    const createOrUpdateCallback = (
        key: string,
        translation: LocalArticleTranslation | undefined
    ) => {
        if (!translation) return

        const customPayload = {
            title: translation?.title,
            content: translation?.content,
            slug: translation?.slug,
            id: translation?.article_id,
            isSelected: true,
            isTouched: true,
            shouldCreateTranslation: false,
        }
        setArticles((prevState) =>
            mapValues(prevState, (articles) =>
                map(articles, (article) =>
                    updateArticleItemByKey(key, article, customPayload)
                )
            )
        )
        handleOnSuccess('Article saved.', dispatch)
    }

    const handleArticleSelect = useCallback((key: string) => {
        setArticles((prevState) =>
            mapValues(prevState, (articles) =>
                map(articles, (article) =>
                    updateArticleItemByKey(key, article, {
                        isSelected: !article.isSelected,
                    })
                )
            )
        )
    }, [])

    const handleArticleEdit = useCallback(
        (key: string) => {
            const article = findArticleByKey(newArticles, key)
            if (article) {
                logEvent(SegmentEvent.WizardArticleEditClicked, {
                    type: article.type,
                })

                setSelectedArticle(article)
                setEditModal({
                    isOpened: true,
                    view: null,
                })
            }
        },
        [newArticles, setEditModal]
    )

    const handleEditorClose = useCallback(() => {
        setSelectedArticle(null)
        setEditModal((prevState) => ({
            ...prevState,
            isOpened: false,
        }))
    }, [setEditModal])

    const handleEditorReady = useCallback(
        (content: string) => {
            if (selectedArticle) {
                setSelectedArticle({
                    ...selectedArticle,
                    content,
                })
            }
        },
        [selectedArticle]
    )

    const handleArticleHover = useCallback(
        (key: string | undefined) => {
            if (!key) {
                setHoveredArticle(null)
                return
            }

            const article = findArticleByKey(newArticles, key)
            if (article) {
                setHoveredArticle(article)
            }
        },
        [newArticles]
    )

    const {isCreateArticleLoading, createArticle} =
        useCreateArticleUsingTemplate(helpCenter)

    const {isCreateArticleTranslationLoading, createArticleTranslation} =
        useCreateArticleTranslationUsingTemplate(helpCenter)

    const {isUpdateArticleTranslationLoading, updateArticleTranslation} =
        useUpdateArticleTranslationUsingTemplate(helpCenter)

    const handleEditorSave = async (title: string, content: string) => {
        if (!selectedArticle?.key) return

        const article = {...selectedArticle, title, content, origin}

        logEvent(SegmentEvent.WizardArticleEdited, {
            type: article.type,
        })

        let nextAction = 'CREATE_ARTICLE'

        if (article.id) {
            nextAction = article.shouldCreateTranslation
                ? 'CREATE_ARTICLE_TRANSLATION'
                : 'UPDATE_ARTICLE_TRANSLATION'
        }

        try {
            switch (nextAction) {
                case 'CREATE_ARTICLE': {
                    const response = await createArticle(article)
                    if (response) {
                        createOrUpdateCallback(
                            article.key,
                            response?.data.translation
                        )
                        handleEditorClose()
                    }
                    break
                }
                case 'CREATE_ARTICLE_TRANSLATION': {
                    const response = await createArticleTranslation(article)
                    if (response) {
                        createOrUpdateCallback(article.key, response?.data)
                        handleEditorClose()
                    }
                    break
                }
                case 'UPDATE_ARTICLE_TRANSLATION': {
                    const response = await updateArticleTranslation(article)
                    if (response) {
                        createOrUpdateCallback(article.key, response?.data)
                        handleEditorClose()
                    }
                    break
                }
            }
        } catch (error) {
            const message =
                typeof error === 'string'
                    ? error
                    : 'Article not successfully saved.'
            handleOnError(error, message, dispatch)
        }
    }

    const trackSelectedItems = () => {
        flatMap(newArticles, (items) => {
            items.forEach((item) => {
                if (item.isSelected) {
                    logEvent(SegmentEvent.WizardArticleSaved, {
                        type: item.type,
                    })
                }
            })
        })
    }

    const handleNavigationSave = async () => {
        // Track every selected item
        trackSelectedItems()

        const selectedItemsWithoutId = flatMap(newArticles, (items) =>
            filter(items, ({isSelected, id}) => isSelected === true && !id)
        )

        const itemsWithId = flatMap(newArticles, (items) =>
            filter(items, ({id}) => id !== undefined)
        )

        const handleArticlesFromTemplate = selectedItemsWithoutId.map(
            (item) => {
                const shouldPublish =
                    item.type === ArticleTemplateType.AI
                        ? true
                        : !!item.isTouched
                return createArticle({...item, origin}, shouldPublish)
            }
        )

        const handleArticlesTranslations = itemsWithId.map((item) => {
            const isSelected = !!item.isSelected
            const isTouched = !!item.isTouched

            if (isSelected) {
                if (item.shouldCreateTranslation) {
                    // If the article is selected, but a translation for a different locale exists, a new translation is created for the current locale
                    return createArticleTranslation(item, isTouched)
                }
                // If the article is selected and touched, it should be marked as published
                if (isTouched) {
                    return updateArticleTranslation(item, true)
                }
            } else {
                // If the article is not selected, it should be marked as draft
                return updateArticleTranslation(item, false)
            }
        })

        try {
            await Promise.all(handleArticlesFromTemplate)
            await Promise.all(handleArticlesTranslations)
        } catch (error) {
            handleOnError(error, 'An error occured.', dispatch)
        }
    }

    return {
        articles: newArticles,
        selectedArticle,
        hoveredArticle,
        isLoading:
            isCreateArticleLoading ||
            isCreateArticleTranslationLoading ||
            isUpdateArticleTranslationLoading,
        handleArticleHover,
        handleArticleSelect,
        handleArticleEdit,
        handleEditorClose,
        handleEditorReady,
        handleEditorSave,
        handleNavigationSave,
    }
}
