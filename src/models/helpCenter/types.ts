import {Components} from '../../../../../rest_api/help_center_api/client.generated'

export type CreateHelpCenterInput = Components.Schemas.CreateHelpcenterDto
export type UpdateHelpCenterInput = Components.Schemas.UpdateHelpcenterDto
export type HelpCenter = Components.Schemas.HelpCenterEntity & {
    supported_locales?: LocaleCode[]
}

export type HelpCenterArticlesListPage = Components.Schemas.ArticlesListPageDto
export type CreateArticleInput = Components.Schemas.CreateArticleDto
export type HelpCenterArticle = Components.Schemas.ArticleWithLocalTranslation & {
    position?: number
}

export type HelpCenterArticleTranslation = Components.Schemas.ArticleTranslationEntity
export type CreateHelpCenterTranslationInput = Components.Schemas.CreateArticleTranslationDto
export type UpdateHelpCenterArticleTranslationInput = Components.Schemas.UpdateArticleTranslationDto

export type HelpCenterLocaleCode = HelpCenter['default_locale']

export type LocaleCode = Components.Schemas.LocaleEntity['code']

export type HelpCenterPreferences = {
    id: number
    subdomain: string
    name: string
    deactivated_datetime: string | null
    created_datetime: string | null
    updated_datetime: string | null
    deleted_datetime?: string | null
    supported_locales: HelpCenterLocale[]
    default_locale: HelpCenterLocale
}

export type HelpCenterLocale = {
    name: string
    code: string
    created_datetime: string
    updated_datetime: string
    deleted_datetime: string | null
}

export type NavigationTranslation = {
    created_datetime: string
    updated_datetime: string
    deleted_datetime: string | null
    id: number | string
    label: string
    value: string
    meta: any // TODO: define this
    navigation_link_id: number
    locale: string
}

export type Category = {
    created_datetime: string
    updated_datetime: string
    deleted_datetime: string | null
    id: number
    position: number
    help_center_id: number
    articles: HelpCenterArticle[]
    translation: {
        created_datetime: string
        updated_datetime: string
        deleted_datetime: string | null
        id: number
        title: string
        description: string
        slug: string
        category_id: number
        locale: string
    }
}

export type NavigationLink = Components.Schemas.NavigationLinkWithLocalTranslation
