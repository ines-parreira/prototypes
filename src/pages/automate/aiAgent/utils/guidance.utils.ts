import {
    ArticleWithLocalTranslationAndRating,
    CreateArticleDto,
} from 'models/helpCenter/types'
import {slugify} from 'utils'
import {CreateGuidanceArticle, GuidanceArticle} from '../types'

export const mapGuidanceToArticleApi = (
    guidanceArticle: GuidanceArticle | CreateGuidanceArticle
): CreateArticleDto => {
    return {
        translation: {
            locale: guidanceArticle.locale,
            title: guidanceArticle.title,
            content: guidanceArticle.content,
            visibility_status: guidanceArticle.visibility,
            excerpt: '',
            slug: slugify(guidanceArticle.title),
            seo_meta: {
                description: null,
                title: null,
            },
        },
    }
}

export const mapArticleApiToGuidanceArticle = (
    articles: ArticleWithLocalTranslationAndRating[]
): GuidanceArticle[] => {
    return articles.map((article) => ({
        id: article.id,
        title: article.translation.title,
        content: article.translation.content,
        locale: article.translation.locale,
        visibility: article.translation.visibility_status,
        lastUpdated: article.updated_datetime,
    }))
}
