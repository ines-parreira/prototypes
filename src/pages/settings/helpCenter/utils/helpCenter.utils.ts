import {
    CreateHelpCenterTranslationInput,
    HelpCenterLocaleCode,
    HelpCenterArticleTranslation,
} from '../../../../models/helpCenter/types'

export const articleRequiredFields: Partial<
    keyof HelpCenterArticleTranslation
>[] = ['title', 'slug', 'content']

export const getNewTranslation = (
    locale: HelpCenterLocaleCode
): CreateHelpCenterTranslationInput => ({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    locale,
})

export function slugify(title: string): string {
    if (title) {
        return encodeURI(title.replace(/ /g, '-').toLowerCase())
    }

    return ''
}
