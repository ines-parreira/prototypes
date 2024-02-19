import {useCallback, useEffect, useState} from 'react'
import {filter, flatMap, map, mapValues} from 'lodash'
import {
    ArticleTemplateCategory,
    HelpCenter,
    HelpCenterArticleItem,
    LocalArticleTranslation,
} from 'models/helpCenter/types'
import {useEditionManager} from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {DEFAULT_ARTICLE_GROUP} from 'pages/settings/helpCenter/constants'
import {
    useCreateArticle,
    useCreateArticleTranslation,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import {slugify} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {
    findArticleByKey,
    handleOnError,
    handleOnSuccess,
    mapHelpCenterArticleItemToArticle,
} from '../HelpCenterCreationWizardUtils'
import {logEvent, SegmentEvent} from '../../../../../../common/segment'

type HelpCenterArticlesFormOutput = {
    articles: Record<ArticleTemplateCategory, HelpCenterArticleItem[]>
    selectedArticle: HelpCenterArticleItem | null

    handleArticleSelect: (key: string) => void
    handleArticleEdit: (key: string) => void

    handleEditorClose: () => void
    handleEditorReady: (content: string) => void
    handleEditorSave: (title: string, content: string) => void

    handleNavigationSave: () => Promise<void>
}
export const useHelpCenterArticlesForm = (
    helpCenter: HelpCenter,
    articles: Record<ArticleTemplateCategory, HelpCenterArticleItem[]>
): HelpCenterArticlesFormOutput => {
    const [newArticles, setArticles] = useState<
        Record<ArticleTemplateCategory, HelpCenterArticleItem[]>
    >(DEFAULT_ARTICLE_GROUP)
    const [selectedArticle, setSelectedArticle] =
        useState<HelpCenterArticleItem | null>(null)

    const {setEditModal} = useEditionManager()

    const dispatch = useAppDispatch()

    const {mutateAsync: createArticleMutateAsync} = useCreateArticle()
    const {mutateAsync: updateArticleTranslationMutateAsync} =
        useUpdateArticleTranslation()
    const {mutateAsync: createArticleTranslationMutateAsync} =
        useCreateArticleTranslation()

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
                    type: 'template',
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

    const createArticle = (
        articleTemplate: HelpCenterArticleItem,
        shouldPublish = false
    ) => {
        const payload = mapHelpCenterArticleItemToArticle({
            article: articleTemplate,
            locale: helpCenter.default_locale,
            shouldPublish,
        })
        if (!payload)
            return Promise.reject(
                'No payload provided during article creation.'
            )

        return createArticleMutateAsync([
            undefined,
            {help_center_id: helpCenter.id},
            payload,
        ])
    }

    const updateArticleTranslation = (
        article: HelpCenterArticleItem,
        shouldPublish = false
    ) => {
        if (!article.id)
            return Promise.reject('No article provided during article update.')

        return updateArticleTranslationMutateAsync([
            undefined,
            {
                help_center_id: helpCenter.id,
                article_id: article.id,
                locale: helpCenter.default_locale,
            },
            {
                title: article.title,
                content: article.content,
                slug: slugify(article.title!),
                is_current: shouldPublish,
            },
        ])
    }

    const createArticleTranslation = (
        articleTemplate: HelpCenterArticleItem,
        shouldPublish = false
    ) => {
        const payload = mapHelpCenterArticleItemToArticle({
            article: articleTemplate,
            locale: helpCenter.default_locale,
            shouldPublish,
        })
        if (!payload || !articleTemplate.id)
            return Promise.reject(
                'No payload provided during article creation.'
            )

        return createArticleTranslationMutateAsync([
            undefined,
            {
                help_center_id: helpCenter.id,
                article_id: articleTemplate.id,
            },
            {...payload?.translation},
        ])
    }

    const handleEditorSave = async (title: string, content: string) => {
        if (!selectedArticle?.key) return

        const article = {...selectedArticle, title, content}

        logEvent(SegmentEvent.WizardArticleEdited, {
            type: 'template',
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
                        type: 'template',
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
                return createArticle(item, !!item.isTouched)
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
        handleArticleSelect,
        handleArticleEdit,
        handleEditorClose,
        handleEditorReady,
        handleEditorSave,
        handleNavigationSave,
    }
}
