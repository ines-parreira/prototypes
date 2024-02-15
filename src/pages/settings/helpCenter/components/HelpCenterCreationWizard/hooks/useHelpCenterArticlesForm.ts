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
    useDeleteArticle,
    useDeleteArticleTranslation,
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
    const {mutateAsync: deleteArticleMutateAsync} = useDeleteArticle()

    const {mutate: updateArticleTranslationMutate} =
        useUpdateArticleTranslation()
    const {mutateAsync: createArticleTranslationMutateAsync} =
        useCreateArticleTranslation()
    const {mutateAsync: deleteArticleTranslationMutateAsync} =
        useDeleteArticleTranslation()

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
        shouldTriggerCallback = true
    ) => {
        const payload = mapHelpCenterArticleItemToArticle(
            articleTemplate,
            helpCenter.default_locale
        )
        if (!payload) return

        return createArticleMutateAsync(
            [undefined, {help_center_id: helpCenter.id}, payload],
            shouldTriggerCallback
                ? {
                      onSuccess: (response) => {
                          createOrUpdateCallback(
                              articleTemplate.key,
                              response?.data.translation
                          )
                      },
                      onError: (error) =>
                          handleOnError(
                              error,
                              'Article not successfully created.',
                              dispatch
                          ),
                  }
                : {}
        )
    }

    const updateArticleTranslation = (
        articleTemplate: HelpCenterArticleItem
    ) => {
        if (!articleTemplate.id) return

        return updateArticleTranslationMutate(
            [
                undefined,
                {
                    help_center_id: helpCenter.id,
                    article_id: articleTemplate.id,
                    locale: helpCenter.default_locale,
                },
                {
                    title: articleTemplate.title,
                    content: articleTemplate.content,
                    slug: slugify(articleTemplate.title!),
                },
            ],
            {
                onSuccess: (response) => {
                    createOrUpdateCallback(articleTemplate.key, response?.data)
                },
                onError: (error) =>
                    handleOnError(
                        error,
                        'Article not successfully updated.',
                        dispatch
                    ),
            }
        )
    }

    const createArticleTranslation = (
        articleTemplate: HelpCenterArticleItem,
        shouldTriggerCallback = true
    ) => {
        const payload = mapHelpCenterArticleItemToArticle(
            articleTemplate,
            helpCenter.default_locale
        )
        if (!payload || !articleTemplate.id) return

        return createArticleTranslationMutateAsync(
            [
                undefined,
                {
                    help_center_id: helpCenter.id,
                    article_id: articleTemplate.id,
                },
                {...payload?.translation},
            ],
            shouldTriggerCallback
                ? {
                      onSuccess: (response) => {
                          createOrUpdateCallback(
                              articleTemplate.key,
                              response?.data
                          )
                      },
                      onError: (error) =>
                          handleOnError(
                              error,
                              'Article not successfully updated.',
                              dispatch
                          ),
                  }
                : {}
        )
    }

    const deleteArticleTranslation = (
        articleTemplate: HelpCenterArticleItem
    ) => {
        if (!articleTemplate.id) return

        const params = {
            help_center_id: helpCenter.id,
            article_id: articleTemplate.id,
            locale: helpCenter.default_locale,
        }
        return deleteArticleTranslationMutateAsync([undefined, params])
    }

    const deleteArticle = (articleTemplate: HelpCenterArticleItem) => {
        if (!articleTemplate.id) return

        const params = {
            help_center_id: helpCenter.id,
            id: articleTemplate.id,
        }
        return deleteArticleMutateAsync([undefined, params])
    }

    const handleEditorSave = async (title: string, content: string) => {
        if (!selectedArticle?.key) return

        const article = {...selectedArticle, title, content}

        logEvent(SegmentEvent.WizardArticleEdited, {
            type: 'template',
        })

        if (article.id) {
            article.shouldCreateTranslation
                ? await createArticleTranslation(article)
                : updateArticleTranslation(article)
        } else {
            await createArticle(article)
        }
        handleEditorClose()
    }

    const handleNavigationSave = async () => {
        const selectedItemsWithoutId = flatMap(newArticles, (items) =>
            filter(
                items,
                ({isSelected, id, shouldCreateTranslation}) =>
                    isSelected === true &&
                    (!id || shouldCreateTranslation === true)
            )
        )

        // Track every selected item
        flatMap(newArticles, (items) => {
            items.forEach((item) => {
                if (item.isSelected) {
                    logEvent(SegmentEvent.WizardArticleSaved, {
                        type: 'template',
                    })
                }
            })
        })

        const unselectedItemsWithId = flatMap(newArticles, (items) =>
            filter(items, ({isSelected, id}) => !isSelected && id !== undefined)
        )

        const createArticlesFromTemplate =
            selectedItemsWithoutId.map(async (item) => {
                return item.shouldCreateTranslation
                    ? createArticleTranslation(item, false)
                    : createArticle(item, false)
            }) || []

        const deleteArticlesFromTemplate =
            unselectedItemsWithId.map(async (item) => {
                const translationsLength = item.availableLocales?.length
                return translationsLength && translationsLength > 1
                    ? deleteArticleTranslation(item)
                    : deleteArticle(item)
            }) || []

        try {
            await Promise.all(createArticlesFromTemplate)
            await Promise.all(deleteArticlesFromTemplate)
        } catch (error) {
            handleOnError(error, 'Articles not successfully updated.', dispatch)
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
