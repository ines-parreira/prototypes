import _isEqual from 'lodash/isEqual'
import _pickBy from 'lodash/pickBy'
import {
    HelpCenter,
    HelpCenterCreationWizardStep,
    Locale,
    LocaleCode,
} from 'models/helpCenter/types'
import {
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

export const isPlatformType = (type: unknown): type is PlatformType => {
    return Object.values(PlatformType).includes(type as PlatformType)
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
        },
        shop_name: data.shopName,
        brand_logo_url: data.brandLogoUrl,
        primary_color: data.primaryColor,
        primary_font_family: data.primaryFontFamily,
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

export const isErrorRecord = (
    error: unknown
): error is Record<string, unknown> => {
    return typeof error === 'object' && error !== null && !Array.isArray(error)
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
