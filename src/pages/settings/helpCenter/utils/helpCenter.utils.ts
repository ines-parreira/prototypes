import {
    CreateArticleTranslationDto,
    HelpCenterArticleTranslation,
    HelpCenterLocaleCode,
} from '../../../../models/helpCenter/types'
import {HELP_CENTER_DOMAIN} from '../constants'

export const articleRequiredFields: Partial<
    keyof HelpCenterArticleTranslation
>[] = ['title', 'slug', 'content']

export const articleOptionalFields: Partial<
    keyof HelpCenterArticleTranslation
>[] = ['excerpt']

export const getNewTranslation = (
    locale: HelpCenterLocaleCode
): CreateArticleTranslationDto => ({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    locale,
})

export function slugify(value: string): string {
    if (value) {
        return encodeURI(
            value
                .replace(/[/;:.',*?!]/g, '')
                .trim()
                .replace(/ /g, '-')
                .toLowerCase()
        )
    }

    return ''
}

export const getAbsoluteUrl = (domain: string): string => `https://${domain}`

export const getHelpCenterDomain = (
    subdomain: string,
    customDomain?: string
): string => customDomain || `${subdomain}${HELP_CENTER_DOMAIN}`

export const buildCategorySlug = ({
    domain,
    locale,
    slug,
    categoryId,
}: {
    domain: string
    locale: string
    slug?: string
    categoryId?: number
}): string => {
    let categorySlug = getAbsoluteUrl(`${domain}/${locale}/articles/`)

    if (slug) {
        categorySlug = `${categorySlug}${slug}`
    }

    if (categoryId) {
        categorySlug = `${categorySlug}-${categoryId.toString()}`
    }

    return categorySlug
}

export const buildArticleSlug = ({
    domain,
    locale,
    slug,
    articleId,
}: {
    domain: string
    locale: string
    slug?: string
    articleId?: number
}): string => {
    let articleSlug = getAbsoluteUrl(`${domain}/${locale}/`)

    if (slug) {
        articleSlug = `${articleSlug}${slug}`
    }

    if (articleId) {
        articleSlug = `${articleSlug}-${articleId.toString()}`
    }

    return articleSlug
}
