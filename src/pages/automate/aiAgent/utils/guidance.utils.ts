import {
    ArticleWithLocalTranslation,
    ArticleWithLocalTranslationAndRating,
    CreateArticleDto,
    UpdateArticleTranslationDto,
} from 'models/helpCenter/types'
import {slugify} from 'utils'
import {
    CreateGuidanceArticle,
    GuidanceArticle,
    UpdateGuidanceArticle,
} from '../types'

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

export const mapUpdateGuidanceArticleToArticleApi = (
    updateGuidanceArticle: UpdateGuidanceArticle
): UpdateArticleTranslationDto => {
    return {
        title: updateGuidanceArticle.title,
        content: updateGuidanceArticle.content,
        slug: updateGuidanceArticle.title
            ? slugify(updateGuidanceArticle.title)
            : undefined,
    }
}

export const mapArticleApiToGuidanceArticle = (
    article: ArticleWithLocalTranslationAndRating | ArticleWithLocalTranslation
): GuidanceArticle => {
    return {
        id: article.id,
        title: article.translation.title,
        content: article.translation.content,
        locale: article.translation.locale,
        visibility: article.translation.visibility_status,
        lastUpdated: article.updated_datetime,
    }
}
