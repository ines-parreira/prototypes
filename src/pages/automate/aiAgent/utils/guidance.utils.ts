import {
    ArticleWithLocalTranslation,
    ArticleWithLocalTranslationAndRating,
    CreateArticleDto,
    UpdateArticleTranslationDto,
} from 'models/helpCenter/types'
import {slugify} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {
    CreateGuidanceArticle,
    GuidanceArticle,
    GuidanceFormFields,
    UpdateGuidanceArticle,
} from '../types'

export const mapGuidanceToArticleApi = (
    guidanceArticle: GuidanceArticle | CreateGuidanceArticle
): CreateArticleDto => {
    return {
        template_key: guidanceArticle.templateKey,
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
        visibility_status: updateGuidanceArticle.visibility,
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
        templateKey: article.template_key || null,
    }
}

export const mapGuidanceFormFieldsToGuidanceArticle = (
    formValues: GuidanceFormFields,
    locale: GuidanceArticle['locale'],
    templateKey?: string
): CreateGuidanceArticle => {
    return {
        title: formValues.name,
        content: formValues.content,
        visibility: formValues.isVisible ? 'PUBLIC' : 'UNLISTED',
        locale,
        templateKey: templateKey || null,
    }
}
