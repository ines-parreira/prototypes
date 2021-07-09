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
export type CategoryTranslation = Components.Schemas.LocalCategoryTranslation
export type CreateCategoryDto = Components.Schemas.CreateCategoryDto

export type HelpCenterLocaleCode = HelpCenter['default_locale']

export type LocaleCode = Components.Schemas.LocaleEntity['code']

export type CreateNavigationLinkDto = Components.Schemas.CreateNavigationLinkDto
export type NavigationLinkMeta = Components.Schemas.NavigationLinkMeta
export type NavigationSocialLinks = Components.Schemas.NavigationLinkMeta['network']

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

export type HelpCenterLocale = Components.Schemas.LocaleEntity

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

export type NavigationLinkSections = Components.Schemas.NavigationLinkEntity['group']

export type BaseNavigationLink = Pick<
    Components.Schemas.NavigationLinkWithLocalTranslation,
    'id' | 'group'
> & {
    translation: LinkTranslation
}

export type LinkTranslation = Pick<
    Components.Schemas.LocalNavigationLinkTranslation,
    | 'label'
    | 'value'
    | 'locale'
    | 'updated_datetime'
    | 'created_datetime'
    | 'navigation_link_id'
>

export type LocalNavigationLink = BaseNavigationLink & {
    position: number
}

export type LocalSocialNavigationLink = Omit<
    LocalNavigationLink,
    'translation'
> & {
    meta: Components.Schemas.NavigationLinkMeta
    translation: Omit<LinkTranslation, 'locale'>
}

export type Category = {
    created_datetime: string
    updated_datetime: string
    deleted_datetime: string | null
    id: number
    position: number
    help_center_id: number
    articles: HelpCenterArticle[]
    translation?: CategoryTranslation
}

export type NavigationLinkDto = Components.Schemas.NavigationLinkWithLocalTranslation
