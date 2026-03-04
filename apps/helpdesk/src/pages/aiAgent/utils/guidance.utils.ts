import type {
    ArticleWithLocalTranslation,
    ArticleWithLocalTranslationAndRating,
    CreateArticleDto,
    UpdateArticleTranslationDto,
} from 'models/helpCenter/types'
import { slugify } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { NotificationStatus } from 'state/notifications/types'

import type {
    AIGuidance,
    CreateGuidanceArticle,
    GuidanceArticle,
    GuidanceFormFields,
    UpdateGuidanceArticle,
} from '../types'

export const mapGuidanceToArticleApi = (
    guidanceArticle: GuidanceArticle | CreateGuidanceArticle,
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
            is_current: guidanceArticle.isCurrent,
        },
    }
}

export const mapUpdateGuidanceArticleToArticleApi = (
    updateGuidanceArticle: UpdateGuidanceArticle,
): UpdateArticleTranslationDto => {
    const intents =
        updateGuidanceArticle.intents === undefined ||
        updateGuidanceArticle.intents === null
            ? undefined
            : (updateGuidanceArticle.intents as UpdateArticleTranslationDto['intents'])

    return {
        title: updateGuidanceArticle.title,
        content: updateGuidanceArticle.content,
        visibility_status: updateGuidanceArticle.visibility,
        slug: updateGuidanceArticle.title
            ? slugify(updateGuidanceArticle.title)
            : undefined,
        is_current: updateGuidanceArticle.isCurrent,
        commit_message: updateGuidanceArticle.commitMessage,
        ...(intents !== undefined
            ? {
                  intents,
                  is_intent_usage_enabled: intents.length > 0,
              }
            : {}),
    }
}

export const mapArticleApiToGuidanceArticle = (
    article: ArticleWithLocalTranslationAndRating | ArticleWithLocalTranslation,
): GuidanceArticle => {
    return {
        id: article.id,
        title: article.translation.title,
        content: article.translation.content,
        locale: article.translation.locale,
        visibility: article.translation.visibility_status,
        createdDatetime: article.created_datetime,
        lastUpdated: article.translation.updated_datetime,
        templateKey: article.template_key || null,
        isCurrent: article.translation.is_current,
        draftVersionId: article.translation.draft_version_id,
        publishedVersionId: article.translation.published_version_id,
        intents: article.translation.intents,
    }
}

export const mapGuidanceFormFieldsToGuidanceArticle = (
    formValues: GuidanceFormFields,
    locale: GuidanceArticle['locale'],
    templateKey?: string,
    isCurrent?: boolean,
): CreateGuidanceArticle => {
    return {
        title: formValues.name,
        content: formValues.content,
        visibility: formValues.isVisible ? 'PUBLIC' : 'UNLISTED',
        locale,
        templateKey: templateKey || null,
        isCurrent,
    }
}

export const mapAIGuidanceDTOToAIGuidance = (
    aiGuidance: Components.Schemas.AIGuidanceDto,
): AIGuidance => {
    return {
        key: aiGuidance.key,
        review_action: aiGuidance.review_action,
        content: aiGuidance.content,
        name: aiGuidance.name,
    }
}

export type DuplicateErrorResult = {
    isDuplicate: boolean
    type?: 'title' | 'content'
    notification?: {
        status: NotificationStatus.Error
        message: string
    }
}

/**
 * Server returns error message when guidance with the same title or content already exists
 * Title error: "An article with the title "..." already exists in this help center"
 * Content error: "An article with identical content already exists in this help center"
 * We check for "already exists" in the error message to handle both cases and display the correct message
 *
 * @param error - The error object from the API
 * @param guidanceName - The name of the guidance being created/updated (for title errors)
 * @returns Object indicating if it's a duplicate error and the appropriate notification
 */
export const handleGuidanceDuplicateError = (
    error: unknown,
    guidanceName: string,
): DuplicateErrorResult => {
    const errorMessage = (error as any)?.response?.data?.error?.msg || ''
    const isDuplicateError = errorMessage.includes('already exists')

    if (!isDuplicateError) {
        return { isDuplicate: false }
    }

    if (errorMessage.includes('title')) {
        return {
            isDuplicate: true,
            type: 'title',
            notification: {
                status: NotificationStatus.Error,
                message: `Guidance with the name "${guidanceName}" already exists in this help center`,
            },
        }
    }

    if (errorMessage.includes('identical content')) {
        return {
            isDuplicate: true,
            type: 'content',
            notification: {
                status: NotificationStatus.Error,
                message:
                    'Guidance with identical instructions already exists in this help center',
            },
        }
    }

    return { isDuplicate: false }
}
