import {
    CreateArticleTranslationDto,
    HelpCenterLocaleCode,
    HelpCenterArticleTranslation,
} from '../../../../models/helpCenter/types'

export const articleRequiredFields: Partial<
    keyof HelpCenterArticleTranslation
>[] = ['title', 'slug', 'content']

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
