import {
    Components,
    Paths,
} from '../../../../../rest_api/help_center_api/client.generated'

// GENERAL

export type LocaleCode = Components.Schemas.LocaleEntity['code']
export type LocaleEntity = Components.Schemas.LocaleEntity

// HELP CENTER

export type CreateHelpcenterDto = Components.Schemas.CreateHelpcenterDto
export type HelpCenter = Components.Schemas.HelpCenterEntity & {
    supported_locales?: LocaleCode[]
}
export type HelpCenterArticlesListPage = Components.Schemas.ArticlesListPageDto
export type HelpCenterArticleTranslation = Components.Schemas.ArticleTranslationEntity

export type HelpCenterLocaleCode = HelpCenter['default_locale']
export type HelpCenterLocale = Components.Schemas.LocaleEntity

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

// CATEGORIES

export type CreateCategoryDto = Components.Schemas.CreateCategoryDto
export type CategoryTranslation = Components.Schemas.LocalCategoryTranslation
export type CategoriesListPage = Components.Schemas.CategoriesListPage
export type CategoryWithLocalTranslation = Components.Schemas.CategoryWithLocalTranslation
export type CreateCategoryTranslationBody = Paths.CreateCategoryTranslation.RequestBody
export type CreateCategoryResponse = Components.Schemas.CategoryWithLocalTranslation
export type UpdateCategoryTranslationResponse = Components.Schemas.CategoryTranslationEntity

export type Category = {
    created_datetime: string
    updated_datetime: string
    deleted_datetime?: string | null
    id: number
    position: number
    help_center_id: number
    available_locales: LocaleCode[]
    articles: HelpCenterArticle[]
    translation?: CategoryTranslation
}

// ARTICLES

export type CreateArticleDto = Components.Schemas.CreateArticleDto
export type CreateArticleTranslationDto = Components.Schemas.CreateArticleTranslationDto
export type UpdateArticleTranslationParameters = Paths.UpdateArticleTranslation.PathParameters

export type ArticleWithLocalTranslation = Components.Schemas.ArticleWithLocalTranslation
export type ArticleTranslation = Components.Schemas.LocalArticleTranslation
export type HelpCenterArticle = Omit<
    Components.Schemas.ArticleWithLocalTranslation,
    'translation'
> & {
    position: number
    available_locales: LocaleCode[]
    translation: ArticleTranslation
}

// NAVIGATION

export type CreateNavigationLinkDto = Components.Schemas.CreateNavigationLinkDto
export type UpdateNavigationLinkDto = Components.Schemas.UpdateNavigationLinkDto
export type NavigationLinkDto = Components.Schemas.NavigationLinkEntity
export type NavigationLinkMeta = Components.Schemas.NavigationLinkMeta
export type NavigationLinkGroup = Components.Schemas.NavigationLinkEntity['group']

export type LocalNavigationLink = Pick<
    Components.Schemas.NavigationLinkEntity,
    | 'id'
    | 'label'
    | 'value'
    | 'locale'
    | 'group'
    | 'created_datetime'
    | 'updated_datetime'
> & {
    key: string
}
export type LocalSocialNavigationLink = Pick<
    Components.Schemas.NavigationLinkEntity,
    | 'id'
    | 'label'
    | 'value'
    | 'group'
    | 'meta'
    | 'created_datetime'
    | 'updated_datetime'
>

// CUSTOM DOMAIN

export type CustomDomain = Components.Schemas.CustomDomain
