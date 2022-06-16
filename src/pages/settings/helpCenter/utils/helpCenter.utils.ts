import {isDevelopment} from 'utils/environment'
import {
    Article,
    ArticleTranslationWithRating,
    CreateArticleDto,
    CreateArticleTranslationDto,
    CreateHelpCenterTranslationDto,
    HelpCenter,
    LocaleCode,
} from 'models/helpCenter/types'
import {HELP_CENTER_DOMAIN, EMOJI_REGEX} from '../constants'

export const articleRequiredFields: Partial<
    keyof CreateArticleTranslationDto
>[] = ['title', 'slug', 'content']

export const getNewArticleTranslation = (
    locale: LocaleCode,
    categoryId: number | null
): CreateArticleTranslationDto => ({
    locale,
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    category_id: categoryId,
    visibility_status: 'PUBLIC',
    seo_meta: {
        title: null,
        description: null,
    },
    is_current: false, // by default, new articles are unpublished
})

export const isExistingArticle = (
    article: CreateArticleDto | Article | null
): article is Article => (article ? 'id' in article : false)

export const isExistingTranslation = (
    translation: any | null
): translation is ArticleTranslationWithRating =>
    translation ? 'created_datetime' in translation : false

export const isNotPublished = (article: Article) =>
    article.translation.is_current === false

export const helpCenterSeoMetaFields: Partial<
    keyof CreateHelpCenterTranslationDto['seo_meta']
>[] = ['title', 'description']

export const getNewHelpCenterTranslation = (
    locale: LocaleCode
): CreateHelpCenterTranslationDto => ({
    locale,
    seo_meta: {
        title: null,
        description: null,
    },
    chat_application_id: null,
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
                .replace(/[/;:.',*?!#]/g, '')
                .replace(/\$/g, 'dollar') // for SEO
                .trim()
                .replace(/ /g, '-')
                .toLowerCase()
        )
    }

    return ''
}

export const getAbsoluteUrl = (
    {
        domain,
        locale,
        path,
    }: {
        domain: string
        locale?: string
        path?: string
    },
    trailingSlash = true
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
    const url = getAbsoluteUrl({domain, locale, path: 'articles'})

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
    const url = getAbsoluteUrl({domain, locale})

    if (!articleId || !slug) {
        return url
    }

    if (isUnlisted) {
        return `${url}${articleId.toString()}-${unlistedId}`
    }

    return `${url}${slug}-${articleId.toString()}`
}
