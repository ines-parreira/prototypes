import {useEffect, useState} from 'react'
import {map, mapValues} from 'lodash'
import {
    ArticleTemplateCategory,
    HelpCenterArticleItem,
} from 'models/helpCenter/types'
import {useEditionManager} from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {DEFAULT_ARTICLE_GROUP} from 'pages/settings/helpCenter/constants'
import {findArticleByKey} from '../HelpCenterCreationWizardUtils'

type HelpCenterArticlesFormOutput = {
    articles: Record<ArticleTemplateCategory, HelpCenterArticleItem[]>
    selectedArticle: HelpCenterArticleItem | null
    handleArticleSelect: (key: string) => void
    handleArticleEdit: (key: string) => void
    handleEditorClose: () => void
    handleEditorReady: (content: string) => void
    handleEditorSave: (title: string, content: string) => void
}

export const useHelpCenterArticlesForm = (
    articles: Record<ArticleTemplateCategory, HelpCenterArticleItem[]>
): HelpCenterArticlesFormOutput => {
    const [newArticles, setArticles] = useState<
        Record<ArticleTemplateCategory, HelpCenterArticleItem[]>
    >(DEFAULT_ARTICLE_GROUP)
    const [selectedArticle, setSelectedArticle] =
        useState<HelpCenterArticleItem | null>(null)

    const {setEditModal} = useEditionManager()

    useEffect(() => {
        setArticles(articles)
    }, [articles])

    const handleArticleSelect = (key: string) => {
        setArticles((prevState) =>
            mapValues(prevState, (articles) =>
                map(articles, (article) =>
                    article.key === key
                        ? {...article, isSelected: !article.isSelected}
                        : article
                )
            )
        )
    }

    const handleArticleEdit = (key: string) => {
        const article = findArticleByKey(newArticles, key)
        if (article) {
            setSelectedArticle(article)
            setEditModal({
                isOpened: true,
                view: null,
            })
        }
    }

    const handleEditorClose = () => {
        setSelectedArticle(null)
        setEditModal((prevState) => ({
            ...prevState,
            isOpened: false,
        }))
    }

    const handleEditorReady = (content: string) => {
        if (selectedArticle) {
            setSelectedArticle({
                ...selectedArticle,
                content,
            })
        }
    }

    const handleEditorSave = (title: string, content: string) => {
        const key = selectedArticle?.key
        if (!key) return
        setArticles((prevState) =>
            mapValues(prevState, (articles) =>
                map(articles, (article) =>
                    article.key === key
                        ? {
                              ...article,
                              title,
                              content,
                              isSelected: true,
                          }
                        : article
                )
            )
        )
        handleEditorClose()
    }

    return {
        articles: newArticles,
        selectedArticle,
        handleArticleSelect,
        handleArticleEdit,
        handleEditorClose,
        handleEditorReady,
        handleEditorSave,
    }
}
