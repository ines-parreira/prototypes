import _isEqual from 'lodash/isEqual'
import _pickBy from 'lodash/pickBy'
import {chain} from 'lodash'
import {
    ARTICLE_TEMPLATES_KEYS,
    ArticleTemplate,
    ArticleTemplateKey,
    ArticleWithLocalTranslationAndRating,
    HelpCenter,
    HelpCenterArticleItem,
    HelpCenterCreationWizardStep,
    Locale,
    LocaleCode,
} from 'models/helpCenter/types'
import {
    DEFAULT_ARTICLE_GROUP,
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_LANGUAGE_DEFAULT_UI,
    HelpCenterCreationWizard,
    PlatformType,
} from 'pages/settings/helpCenter/constants'
import {Language as LanguagePickerItem} from 'pages/common/components/LanguagePicker/LanguagePicker'
import {IntegrationFromType, IntegrationType} from 'models/integration/types'
import {validLocaleCode} from 'models/helpCenter/utils'
import {isGorgiasApiError} from 'models/api/types'
import {StoreDispatch} from 'state/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'
import {Entrypoint} from 'pages/automate/common/components/WorkflowsFeatureList'
import {Components} from 'rest_api/help_center_api/client.generated'
import {slugify} from '../../utils/helpCenter.utils'

export const isPlatformType = (type: unknown): type is PlatformType => {
    return Object.values(PlatformType).includes(type as PlatformType)
}

export const isErrorRecord = (
    error: unknown
): error is Record<string, unknown> => {
    return typeof error === 'object' && error !== null && !Array.isArray(error)
}

function isArticleTemplateKey(key: unknown): key is ArticleTemplateKey {
    return ARTICLE_TEMPLATES_KEYS.includes(key as any)
}

export const isHelpCenterCreationWizardStep = (
    step: unknown
): step is HelpCenterCreationWizardStep => {
    return Object.values(HelpCenterCreationWizardStep).includes(
        step as HelpCenterCreationWizardStep
    )
}

/**
 * Map API Help Center to UI Help Center which is used in the UI
 * Some considerations:
 * - If a new help center is created via wizard, then helpCenter will be undefined
 * - If a help center is edited via wizard, then helpCenter will be defined
 * - If there is only one store integration, it will be selected by default
 * - If there is more than one store integration, the one that matches the shop_name will be selected by default
 */
export const mapApiHelpCenterToUIHelpCenter = (
    helpCenter: HelpCenter | undefined,
    allStoreIntegrations: IntegrationFromType<
        | IntegrationType.Shopify
        | IntegrationType.BigCommerce
        | IntegrationType.Magento2
    >[]
): HelpCenterCreationWizard => {
    const integration =
        allStoreIntegrations.length === 1 ? allStoreIntegrations[0] : undefined

    const platformType = helpCenter?.wizard?.step_data?.platform_type
    const stepName = helpCenter?.wizard?.step_name

    return {
        name: helpCenter?.name || '',
        subdomain: helpCenter?.subdomain || '',
        defaultLocale: helpCenter?.default_locale || HELP_CENTER_DEFAULT_LOCALE,
        supportedLocales: helpCenter?.supported_locales || [
            HELP_CENTER_DEFAULT_LOCALE,
        ],
        platformType: isPlatformType(platformType)
            ? platformType
            : PlatformType.ECOMMERCE,
        stepName: isHelpCenterCreationWizardStep(stepName)
            ? stepName
            : HelpCenterCreationWizardStep.Basics,
        shopName: helpCenter?.shop_name || integration?.name || '',
        brandLogoUrl: helpCenter?.brand_logo_url || null,
        primaryColor: helpCenter?.primary_color || '',
        primaryFontFamily: helpCenter?.primary_font_family || '',
        deactivated: helpCenter
            ? helpCenter.deactivated_datetime !== null
            : true, // when no help center we mark it as unpublished by default
    }
}

/**
 * Map UI Help Center to API Help Center
 */
export const mapUIHelpCenterToApiHelpCenter = (
    data: HelpCenterCreationWizard
) => {
    const result = {
        name: data.name,
        subdomain: data.subdomain,
        default_locale: data.defaultLocale,
        wizard: {
            step_name: data.stepName,
            step_data: {
                platform_type: data.platformType,
            },
            completed: data.wizardCompleted,
        },
        shop_name: data.shopName,
        brand_logo_url: data.brandLogoUrl,
        primary_color: data.primaryColor,
        primary_font_family: data.primaryFontFamily,
        self_service_deactivated: !data.orderManagementEnabled,
        deactivated: data.deactivated,
    }

    Object.keys(result).forEach((key) => {
        const typedKey = key as keyof typeof result
        if (result[typedKey] === '') {
            delete result[typedKey]
        }
    })

    return result
}

/**
 * Map help center locales to the format used in the LanguagePicker component
 */
export const mapHelpCenterLocalesToLanguagePicker = (
    locales: Locale[]
): LanguagePickerItem[] => {
    return locales.map((locale: Locale) => ({
        value: locale.code,
        label: locale.name,
    }))
}

/**
 * Map help center supported languages to language picker format
 */
export const mapHelpCenterLanguagesToLanguagePicker = (
    helpCenter: HelpCenter | undefined,
    uiLanguageOptions: LanguagePickerItem[]
) => {
    const defaultLocale = helpCenter?.default_locale
    const supportedLanguages = helpCenter?.supported_locales

    if (!helpCenter || !defaultLocale || !supportedLanguages) {
        return HELP_CENTER_LANGUAGE_DEFAULT_UI
    }

    const newLanguages =
        supportedLanguages?.map((languageCode: string) => {
            const matchedLanguage: LanguagePickerItem | undefined =
                uiLanguageOptions.find(
                    (lang: LanguagePickerItem) => lang.value === languageCode
                )

            return {
                value: languageCode,
                label: matchedLanguage?.label as string,
                isDefault: languageCode === defaultLocale,
            }
        }) || []

    return newLanguages
}

/**
 * Map language picker format to help center supported languages, so it can be sent to the endpoint
 */
export const mapLanguagePickerToHelpCenterLanguages = (
    languages: LanguagePickerItem[]
): {defaultLocale: LocaleCode; supportedLocales: LocaleCode[]} => {
    let defaultLocale = HELP_CENTER_DEFAULT_LOCALE
    const helpCenterLanguages: LocaleCode[] = languages.map(
        (language: LanguagePickerItem) => {
            if (language.isDefault) {
                defaultLocale = validLocaleCode(language.value)
            }

            return validLocaleCode(language.value)
        }
    )

    return {defaultLocale, supportedLocales: helpCenterLanguages}
}

/**
 * Map entrypoints from workflow list to help center automation settings
 */
export const mapEntrypointsToAutomationSettings = (
    entrypoints: Entrypoint[]
): Components.Schemas.UpsertAutomationSettingsDto => {
    const workflows = entrypoints.map((entrypoint) => ({
        id: entrypoint.workflow_id,
        enabled: entrypoint.enabled,
    }))
    return {workflows}
}

/**
 * Return the fields that have been updated in the UI
 */
export const getUpdatedFields = (
    newHelpCenter: Partial<HelpCenter>,
    helpCenter: HelpCenter
): Partial<HelpCenter> => {
    return _pickBy(newHelpCenter, (value: any, key: keyof HelpCenter) => {
        return !_isEqual(value, helpCenter[key])
    })
}

export const handleOnSuccess = (message: string, dispatch: StoreDispatch) => {
    void dispatch(
        notify({
            status: NotificationStatus.Success,
            message,
        })
    )
}

export const handleOnError = (
    error: Record<string, unknown> | Error | unknown,
    message: string,
    dispatch: StoreDispatch
) => {
    let newError
    if (
        error instanceof Error ||
        (isErrorRecord(error) && isGorgiasApiError(error))
    ) {
        newError = error
    } else {
        newError = new Error('Oups something went wrong')
    }

    reportError(newError)
    void dispatch(
        notify({
            status: NotificationStatus.Error,
            message,
        })
    )
}

export const groupArticlesByCategory = (
    articles: HelpCenterArticleItem[]
): Record<string, HelpCenterArticleItem[]> => {
    return articles.reduce((groups, item) => {
        const category = item.category || 'other'
        return {...groups, [category]: [...(groups[category] || []), item]}
    }, DEFAULT_ARTICLE_GROUP)
}

/**
 * Map article templates to the format used in the HelpCenterCreationWizard
 * It considers article templates and articles for the current help center
 * If there is no match between templates and articles, it means that there are no articles created based on the template
 * If there is a match, locale is checked to see if there is a translation for the current locale
 * If there is no translation for the locale, add id of the article so a new translation can be created
 */
export const mapHelpCenterArticleData = (
    articleTemplates: ArticleTemplate[],
    articleListData: ArticleWithLocalTranslationAndRating[],
    locale: LocaleCode
): HelpCenterArticleItem[] => {
    return articleTemplates.map((template) => {
        const matchingData = articleListData.find(
            (data) => data.template_key === template.key
        )

        if (!matchingData) {
            return {
                ...template,
                content: template.html_content?.replace(/\\n/g, ''),
                isSelected: false,
            }
        }

        if (matchingData.translation?.locale === locale) {
            const content = matchingData.translation?.content
            return {
                ...matchingData.translation,
                id: matchingData.id,
                content: content?.replace(/\\n/g, ''),
                isSelected: true,
                key: template.key,
                category: template.category,
                availableLocales: matchingData.available_locales,
            }
        }

        return {
            ...template,
            content: template.html_content?.replace(/\\n/g, ''),
            id: matchingData.id,
            availableLocales: matchingData.available_locales,
            isSelected: false,
            shouldCreateTranslation: true,
        }
    })
}

export const findArticleByKey = (
    data: Record<string, HelpCenterArticleItem[]>,
    key: string
): HelpCenterArticleItem | undefined => {
    return chain(data)
        .values()
        .flatten()
        .find((item) => item.key === key)
        .value() as HelpCenterArticleItem | undefined
}

/**
 * Map articles UI to API Help Center articles
 */
export const mapHelpCenterArticleItemToArticle = (
    articleItem: HelpCenterArticleItem,
    locale: LocaleCode
) => {
    if (!articleItem.title || !articleItem.content) return null

    const article = {
        translation: {
            title: articleItem.title,
            content: articleItem.content,
            seo_meta: articleItem.seo_meta || {
                title: null,
                description: null,
            },
            excerpt: '',
            slug: slugify(articleItem.title),
            locale,
        },
    }

    return {
        ...article,
        template_key: isArticleTemplateKey(articleItem.key)
            ? articleItem.key
            : undefined,
    }
}

export const getEnabledArticlesCount = (
    articlesRecord: Record<string, HelpCenterArticleItem[]>
) =>
    chain(articlesRecord)
        .values()
        .flatten()
        .countBy('isSelected')
        .get('true')
        .value()
