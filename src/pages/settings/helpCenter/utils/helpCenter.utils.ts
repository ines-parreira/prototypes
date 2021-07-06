import {
    CreateHelpCenterTranslationInput,
    HelpCenterLocaleCode,
    HelpCenterArticleTranslation,
} from '../../../../models/helpCenter/types'

export const articleRequiredFields: Partial<
    keyof HelpCenterArticleTranslation
>[] = ['title', 'slug', 'excerpt', 'content']

export const getNewTranslation = (
    locale: HelpCenterLocaleCode
): CreateHelpCenterTranslationInput => ({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    locale,
})
