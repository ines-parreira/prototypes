import {CreateArticleDto} from 'models/helpCenter/types'
import {slugify} from 'utils'
import {GuidanceArticle} from '../types'

export const mapGuidanceToArticleApi = (
    guidanceArticle: GuidanceArticle
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
