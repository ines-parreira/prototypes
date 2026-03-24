import { reportError } from '@repo/logging'
import { isDevelopment } from '@repo/utils'
import copy from 'copy-to-clipboard'

import type {
    AIArticle,
    Article,
    ArticleTemplateKey,
    ArticleTranslationWithRating,
    CreateArticleDto,
    CreateArticleTranslationDto,
    CreateHelpCenterTranslationDto,
    CustomerVisibility,
    HelpCenter,
    HelpCenterArticleItem,
    LocaleCode,
} from 'models/helpCenter/types'
import {
    ARTICLE_TEMPLATES_KEYS,
    CustomerVisibilityEnum,
    VisibilityStatusEnum,
} from 'models/helpCenter/types'
import type { StoreIntegration } from 'models/integration/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'

import {
    ARTICLE_HASH_PREFIX,
    CATEGORY_HASH_PREFIX,
    EMOJI_REGEX,
    HELP_CENTER_DEFAULT_LAYOUT,
    HELP_CENTER_DOMAIN,
} from '../constants'
import type { ArticleOrigin } from '../types/articleOrigin.enum'
import type { HelpCenterLayout } from '../types/layout.enum'
import { isHelpCenterLayout } from '../types/layout.enum'

export const articleRequiredFields: Partial<
    keyof CreateArticleTranslationDto
>[] = ['title', 'slug', 'content']

export const getNewArticleTranslation = (
    locale: LocaleCode,
    categoryId: number | null,
): CreateArticleTranslationDto => ({
    locale,
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    category_id: categoryId,
    visibility_status: VisibilityStatusEnum.PUBLIC,
    seo_meta: {
        title: null,
        description: null,
    },
    is_current: false, // by default, new articles are unpublished
})

export const isExistingArticle = (
    article: CreateArticleDto | Article | null,
): article is Article => (article ? 'id' in article : false)

export const isExistingTranslation = (
    translation: any,
): translation is ArticleTranslationWithRating =>
    translation ? 'created_datetime' in translation : false

export const isNotPublished = (article: Article) =>
    article.translation.is_current === false

export const helpCenterSeoMetaFields: Partial<
    keyof CreateHelpCenterTranslationDto['seo_meta']
>[] = ['title', 'description']

export const getNewHelpCenterTranslation = (
    locale: LocaleCode,
): CreateHelpCenterTranslationDto => ({
    locale,
    seo_meta: {
        title: null,
        description: null,
    },
    chat_app_key: null,
})

// Translate all the "common accented characters" from this list : https://practicaltypography.com/common-accented-characters.html
export function removeAccents(value: string): string {
    return value
        .replace(/[áàâäãå]/gi, 'a')
        .replace(/[ç]/gi, 'c')
        .replace(/[éèêë]/gi, 'e')
        .replace(/[íìîï]/gi, 'i')
        .replace(/[ñ]/gi, 'n')
        .replace(/[óòôöõø]/gi, 'o')
        .replace(/[úùûü]/gi, 'u')
        .replace(/[æ]/gi, 'ae')
        .replace(/[œ]/gi, 'oe')
        .replace(/[ß]/gi, 'ss')
        .toLowerCase()
}

// Remove all the emojis from a string value (source: https://mths.be/emoji)
export function removeEmojis(value: string): string {
    return value.replace(EMOJI_REGEX, '').trim()
}

export function slugify(value: string): string {
    if (value) {
        const valueWithoutAccentsAndEmojis = removeEmojis(removeAccents(value))

        return encodeURI(
            valueWithoutAccentsAndEmojis
                .replace(/[/;:.',*?!¿¡ªº#]/g, '')
                .replace(/\$/g, 'dollar') // for SEO
                .replace(/&/g, 'and') // for SEO
                .trim()
                .replace(/ /g, '-')
                .toLowerCase(),
        )
    }

    return ''
}

export const getAbsoluteUrl = (
    {
        domain,
        locale,
        path,
        queryString,
    }: {
        domain: string
        locale?: string
        path?: string
        queryString?: string
    },
    trailingSlash = true,
): string => {
    const hasProtocol = /^((http|https|ftp):\/\/)/
    const protocol = isDevelopment() ? 'http' : 'https'

    let url = hasProtocol.test(domain) ? domain : `${protocol}://${domain}`

    if (locale) {
        url += `/${locale}`
    }

    if (path) {
        url += `/${path}`
    }

    if (trailingSlash && !url.endsWith('/')) {
        url += '/'
    }

    if (queryString) {
        url += `?${queryString}`
    }

    return url
}

export const getHelpCenterDomain = (helpCenter: HelpCenter): string =>
    helpCenter.customDomain?.hostname ||
    `${helpCenter.subdomain}${HELP_CENTER_DOMAIN}`

export const getCategoryUrl = ({
    domain,
    locale,
    slug,
    categoryId,
    unlistedId = '',
    isUnlisted,
}: {
    domain: string
    locale: string
    slug?: string
    categoryId?: number
    unlistedId?: string
    isUnlisted?: boolean
}): string => {
    const url = getAbsoluteUrl({ domain, locale, path: 'articles' })

    if (!slug || !categoryId) {
        return url
    }

    if (isUnlisted) {
        return `${url}${categoryId.toString()}-${unlistedId}`
    }

    return `${url}${slug}-${categoryId.toString()}`
}

export const getArticleUrl = ({
    domain,
    locale,
    slug,
    articleId,
    unlistedId,
    isUnlisted,
}: {
    domain: string
    locale: string
    slug?: string
    articleId?: number
    unlistedId: string
    isUnlisted: boolean
}): string => {
    const url = getAbsoluteUrl({ domain, locale })

    if (!articleId || !slug) {
        return url
    }

    if (isUnlisted) {
        return `${url}${articleId.toString()}-${unlistedId}`
    }

    return `${url}${slug}-${articleId.toString()}`
}

type ItemType = 'article' | 'category'
export const getHomePageItemHashUrl = ({
    itemType,
    domain,
    locale,
    itemId,
    isUnlisted,
}: {
    itemType: ItemType
    domain: string
    locale: string
    itemId?: number
    isUnlisted?: boolean
}): string => {
    const url = getAbsoluteUrl({ domain, locale })
    const isTrailingSlash = url.slice(-1) === '/'
    const sanitizedUrl = isTrailingSlash ? url.slice(0, -1) : url

    if (!itemId || isUnlisted) {
        return sanitizedUrl
    }

    switch (itemType) {
        case 'category':
            return `${sanitizedUrl}#${CATEGORY_HASH_PREFIX}-${itemId.toString()}`
        case 'article':
            return `${sanitizedUrl}#${ARTICLE_HASH_PREFIX}-${itemId.toString()}`
    }
}

// This function is used to replace "uploads.gorgias.io" to "attachments.gorgias.help"
// Because files in "uploads.gorgias.io" are no longer available
// TODO: remove this function as soon as we change paths in the DB
export const replaceUploadUrls = (originalStr: string): string => {
    return originalStr.replace(
        /https:\/\/uploads.gorgias.io\//g,
        'https://attachments.gorgias.help/uploads.gorgias.io/',
    )
}

export const isArticleTemplateKey = (
    key: unknown,
): key is ArticleTemplateKey => {
    return ARTICLE_TEMPLATES_KEYS.includes(key as any)
}

type HelpCenterArticleParams = {
    article: HelpCenterArticleItem
    locale: LocaleCode
    shouldPublish: boolean
}

export const mapHelpCenterArticleItemToArticle = (
    params: HelpCenterArticleParams,
) => {
    const { article, locale, shouldPublish } = params

    if (!article.title || !article.content) return null

    const hcArticle = {
        translation: {
            title: article.title,
            content: article.content,
            seo_meta: article.seo_meta || {
                title: null,
                description: null,
            },
            excerpt: '',
            slug: slugify(article.title),
            locale,
            is_current: shouldPublish,
        },
    }

    return {
        ...hcArticle,
        template_key: article.key,
        origin: article.origin,
    }
}

type AILibraryArticleItemParams = {
    article: AIArticle
    locale: LocaleCode
    categoryId?: number | null
    customerVisibility?: CustomerVisibility
    publish: boolean
    origin?: ArticleOrigin
}

export const mapAILibraryArticleItemToArticle = (
    params: AILibraryArticleItemParams,
): CreateArticleDto | null => {
    const { article, locale, categoryId, customerVisibility, publish, origin } =
        params

    if (!article.title || !article.html_content) return null

    const hcArticle = {
        translation: {
            title: article.title,
            content: article.html_content,
            seo_meta: {
                title: null,
                description: null,
            },
            category_id: categoryId || null,
            excerpt: '',
            slug: slugify(article.title),
            locale,
            is_current: publish,
            customer_visibility:
                customerVisibility || CustomerVisibilityEnum.PUBLIC,
        },
    }

    return {
        ...hcArticle,
        template_key: article.key,
        origin,
    }
}

export const getHelpCenterLayout = (
    helpCenter: HelpCenter | undefined,
): HelpCenterLayout =>
    helpCenter?.layout && isHelpCenterLayout(helpCenter.layout)
        ? helpCenter.layout
        : HELP_CENTER_DEFAULT_LAYOUT

export const getValidStoreIntegrationId = (
    allStoreIntegrations: StoreIntegration[],
    helpCenterShopName: string | null,
): number | null => {
    if (!allStoreIntegrations || allStoreIntegrations.length === 0) {
        return null
    }

    const hasMultiStores = allStoreIntegrations.length > 1

    const storeIntegration = allStoreIntegrations.find(
        (storeIntegration) => storeIntegration.name === helpCenterShopName,
    )

    return !hasMultiStores
        ? allStoreIntegrations[0].id
        : (storeIntegration?.id ?? null)
}

export const copyArticleLinkToClipboard = (props: {
    article: Article
    isUnlisted: boolean
    helpCenter: HelpCenter
    hasDefaultLayout: boolean
    dispatch: StoreDispatch
}) => {
    const { article, isUnlisted, helpCenter, hasDefaultLayout, dispatch } =
        props

    if (!article.translation) {
        void dispatch(
            notify({
                message: 'Failed to copy the link',
                status: NotificationStatus.Error,
            }),
        )
        reportError(new Error('Help Center Article has no translation'), {
            extra: { article },
        })
        return
    }
    const { id: articleId, translation } = article
    const { locale, slug, article_unlisted_id: unlistedId } = translation

    const domain = getHelpCenterDomain(helpCenter)

    try {
        copy(
            hasDefaultLayout
                ? getArticleUrl({
                      domain,
                      locale,
                      slug,
                      articleId,
                      unlistedId,
                      isUnlisted,
                  })
                : getHomePageItemHashUrl({
                      itemType: 'article',
                      domain,
                      locale,
                      itemId: articleId,
                      isUnlisted,
                  }),
        )

        void dispatch(
            notify({
                message: 'Link copied with success',
                status: NotificationStatus.Success,
            }),
        )
    } catch (err) {
        void dispatch(
            notify({
                message: 'Failed to copy the link',
                status: NotificationStatus.Error,
            }),
        )
        reportError(err as Error)
    }
}
