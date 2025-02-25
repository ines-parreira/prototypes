import { fromJS, List, Map } from 'immutable'

import { Language as LanguagePickerItem } from 'pages/common/components/LanguagePicker/LanguagePicker'

import { Language } from '../../constants/languages'
import {
    GorgiasChatIntegrationMeta,
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
    Integration,
    IntegrationType,
} from '../../models/integration/types'
import gorgiasChatSSPTexts from './ssp_texts.json'
import { widgetTexts } from './widget'

export const GORGIAS_CHAT_NAME_MAX_LENGTH = 100
export const GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH = 50

export const GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT = Language.EnglishUs

export interface LanguageItem {
    language: Language
    primary?: boolean
}

export interface LanguageUI {
    value: string
    label: string
}

export const GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT: List<LanguageItem> = fromJS(
    [
        {
            language: Language.EnglishUs,
            primary: true,
        },
    ],
)

export const GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT_UI: List<
    Map<string, string>
> = fromJS([
    { value: Language.EnglishUs, label: 'English (US)', isDefault: true },
])

export const GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS: List<Map<string, string>> =
    fromJS([
        { value: Language.EnglishUs, label: 'English - US' },
        { value: Language.EnglishGb, label: 'English - GB' },
        { value: Language.FrenchFr, label: 'French - FR' },
        { value: Language.German, label: 'German' },
        { value: Language.Spanish, label: 'Spanish' },
        { value: Language.Czech, label: 'Czech' },
        { value: Language.Danish, label: 'Danish' },
        { value: Language.Dutch, label: 'Dutch' },
        { value: Language.Finnish, label: 'Finnish' },
        { value: Language.FrenchCa, label: 'French - CA' },
        { value: Language.Italian, label: 'Italian' },
        { value: Language.Japanese, label: 'Japanese' },
        { value: Language.Norwegian, label: 'Norwegian' },
        { value: Language.PortugueseBrazil, label: 'Portuguese - BR' },
        { value: Language.Swedish, label: 'Swedish' },
    ])

// TODO: remove this function and use GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS once all languages are supported without feature flag
export const getGorgiasChatLanguageOptions = (
    enableNewLanguages?: boolean,
): List<Map<string, string>> => {
    const languages = [
        { value: Language.EnglishUs, label: 'English - US' },
        { value: Language.EnglishGb, label: 'English - GB', isNew: true },
        { value: Language.FrenchFr, label: 'French - FR' },
        { value: Language.German, label: 'German' },
        { value: Language.Spanish, label: 'Spanish' },
        { value: Language.Czech, label: 'Czech' },
        { value: Language.Danish, label: 'Danish' },
        { value: Language.Dutch, label: 'Dutch' },
        { value: Language.Finnish, label: 'Finnish', isNew: true },
        { value: Language.FrenchCa, label: 'French - CA' },
        { value: Language.Italian, label: 'Italian' },
        { value: Language.Japanese, label: 'Japanese', isNew: true },
        { value: Language.Norwegian, label: 'Norwegian' },
        {
            value: Language.PortugueseBrazil,
            label: 'Portuguese - BR',
            isNew: true,
        },

        { value: Language.Swedish, label: 'Swedish' },
    ]

    const filteredLanguages = enableNewLanguages
        ? languages
        : languages.filter((language) => !language.isNew)

    return fromJS(filteredLanguages) as List<Map<string, string>>
}

export const GORGIAS_CHAT_WIDGET_TEXTS: {
    [locale: string]: { [key: string]: string }
} = widgetTexts
export const GORGIAS_CHAT_SSP_TEXTS: {
    [locale: string]: { [key: string]: string }
} = gorgiasChatSSPTexts
export const GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS =
    GORGIAS_CHAT_WIDGET_TEXTS[GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]
export const GORGIAS_CHAT_DEFAULT_COLOR = '#115cb5'

export const GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT = 'Inter'
export const GORGIAS_CHAT_DEFAULT_FONTS = [
    'Arial',
    'Georgia',
    'Impact',
    'Inter',
    'Merriweather',
    'Source Code Pro',
    'Tahoma',
    'Times New Roman',
    'Verdana',
]

// Email capture
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT = true
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL = 'optional'
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS_DEPRECATED =
    'required-outside-business-hours'
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED =
    'always-required'
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT =
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL

export const GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT = null

// Privacy policy disclaimer
export const GORGIAS_CHAT_WIDGET_PRIVACY_POLICY_DISCLAIMER_ENABLED_DEFAULT =
    true

// Auto responder
export const GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT = true
export const GORGIAS_CHAT_AUTO_RESPONDER_REPLY_SHORTLY = 'reply-shortly'
export const GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES = 'reply-in-minutes'
export const GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS = 'reply-in-hours'
export const GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_DAY = 'reply-in-day'
export const GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC = 'reply-dynamic'

export const GORGIAS_CHAT_AUTO_RESPONDER_REPLY_OPTIONS = [
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
] as const

export const isAutoresponderReply = (
    option: any,
): option is (typeof GORGIAS_CHAT_AUTO_RESPONDER_REPLY_OPTIONS)[number] => {
    return GORGIAS_CHAT_AUTO_RESPONDER_REPLY_OPTIONS.includes(option)
}

// Live chat availability / Auto offline mode
export const GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY =
    'auto-based-on-agent-availability'
export const GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS =
    'always-live-during-business-hours'
export const GORGIAS_CHAT_LIVE_CHAT_OFFLINE = 'offline'

// Company picture types
export const GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS = 'team-members'
export const GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE = 'team-picture'
export const GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT =
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS

// Position
export const GORGIAS_CHAT_WIDGET_POSITION_DEFAULT: GorgiasChatPosition = {
    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
    offsetX: 0,
    offsetY: 0,
}
export const GORGIAS_CHAT_WIDGET_POSITION_OPTIONS: List<
    Map<string, GorgiasChatPositionAlignmentEnum | string>
> = fromJS([
    {
        value: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
        label: 'Bottom right',
    },
    {
        value: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
        label: 'Bottom left',
    },
    { value: GorgiasChatPositionAlignmentEnum.TOP_RIGHT, label: 'Top right' },
    { value: GorgiasChatPositionAlignmentEnum.TOP_LEFT, label: 'Top left' },
])

// Quick replies
export const QUICK_REPLIES_DEFAULTS = fromJS([
    'Get order status',
    'Apply promo code',
])
export const QUICK_REPLIES_MAX_ITEMS = 3
export const QUICK_REPLIES_MAX_ITEM_LENGTH = 20

// util functions for gorgias chat languages
export const getGorgiasChatLanguageByCode = (language: Language) =>
    (GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.toJS() as LanguageUI[]).find(
        (item: LanguageUI) => item.value === language,
    )

export const getPrimaryLanguage = (
    languages: List<Map<string, string>>,
): LanguageItem =>
    languages
        .find((lang) => !!lang?.get('primary') === true)
        ?.toJS() as LanguageItem

export const getPrimaryLanguageUI = (languages: List<Map<string, string>>) => {
    const primaryLanguage = getPrimaryLanguage(languages)
    if (!primaryLanguage) return null
    return getGorgiasChatLanguageByCode(primaryLanguage.language)
}

export const getSecondaryLanguages = (
    languages: List<Map<string, string>>,
): LanguageItem[] =>
    languages
        .filter((lang) => !!lang?.get('primary') === false)
        ?.toJS() as LanguageItem[]

export const getSecondaryLanguagesAsTooltipContent = (
    languages: LanguageItem[],
): string => {
    return languages
        .map((lang) => getGorgiasChatLanguageByCode(lang.language)?.label)
        .join('<br>')
}

export const mapIntegrationLanguagesToLanguagePicker = (
    integration: Map<any, any>,
): LanguagePickerItem[] => {
    const languages: LanguageItem[] = (
        integration.getIn(['meta', 'languages']) as List<Map<string, string>>
    )?.toJS()
    const languageOptions: LanguagePickerItem[] =
        GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.toJS()

    const language = integration.getIn(['meta', 'language']) as string

    if (!languages && !language)
        return GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT_UI.toJS() as LanguagePickerItem[]

    const newLanguages =
        languages?.map((language: LanguageItem) => {
            const matchedLanguage: LanguagePickerItem | undefined =
                languageOptions.find(
                    (lang: LanguagePickerItem) =>
                        lang.value === language.language,
                )

            return {
                value: language.language,
                label: matchedLanguage?.label as string,
                isDefault: language.primary ?? false,
            }
        }) || []

    // fallback to language if languages is not set
    if (newLanguages.length === 0) {
        const matchedLanguage: LanguagePickerItem | undefined =
            languageOptions.find(
                (lang: LanguagePickerItem) => lang.value === language,
            )
        newLanguages.push({
            value: language as Language,
            label: matchedLanguage?.label as string,
            isDefault: true,
        })
    }
    return newLanguages
}

export const mapLanguagePickerToIntegrationLanguages = (
    languages: LanguagePickerItem[],
) => {
    const integrationLanguages: LanguageItem[] = languages.map(
        (language: LanguagePickerItem) => ({
            language: language.value as Language,
            ...(language.isDefault ? { primary: language.isDefault } : {}),
        }),
    )

    return integrationLanguages
}

/**
 * @param integration Gorgias Chat integration
 * @returns List of languages that are not yet added to the integration to display in the language dropdown
 */
export const mapLanguageOptionsToLanguageDropdown = (
    integration: Map<any, any>,
    enableNewLanguages: boolean,
): LanguagePickerItem[] => {
    const languageIntegration = integration.getIn([
        'meta',
        'language',
    ]) as string
    const languagesIntegration: LanguageItem[] = (
        (integration.getIn(['meta', 'languages']) as List<
            Map<string, string>
        >) || fromJS([])
    ).toJS()
    const languageOptions: LanguagePickerItem[] =
        getGorgiasChatLanguageOptions(enableNewLanguages).toJS()

    if (!languagesIntegration && !languageIntegration)
        return GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT_UI.toJS() as LanguagePickerItem[]

    // We add the legacy 'language' value as default language if no languages are set
    if (!languagesIntegration.length) {
        languagesIntegration.push({
            language: languageIntegration as Language,
            primary: true,
        })
    }

    // We filter out the languages that are already added to the integration
    return languageOptions.filter((languageOption: LanguagePickerItem) => {
        const matchedLanguage: LanguageItem | undefined =
            languagesIntegration.find(
                (languageItem: LanguageItem) =>
                    languageOption.value === languageItem.language,
            )

        return !matchedLanguage
    })
}

export const getLanguagesFromChatConfig = (
    meta: GorgiasChatIntegrationMeta,
): string[] => {
    return meta.languages
        ? meta.languages.map((x) => x.language)
        : [meta.language ?? GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]
}

export const getPrimaryLanguageFromChatConfig = (
    meta?: GorgiasChatIntegrationMeta,
): string => {
    return (
        meta?.languages?.find((language) => language.primary)?.language ??
        (meta?.language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT)
    )
}

// NOTE. This is a copy of `isTextsMultiLanguage` @ gorgias/gorgias-chat.
/**
 * Helper to detect if `texts` is the legacy format (mono-language) or the new format (multi-language).
 * - Legacy: `{"texts": { ...}, "sppTexts": {...}, "meta": {...}}`
 * - New: `{"en": {"texts": {...}, "sppTexts": {...}, "meta": {...}}, "fr": {...}}`
 */
export const isTextsMultiLanguage = (value: unknown): boolean => {
    if (value && typeof value === 'object' && value !== null) {
        const objValue = value as Record<string, unknown>
        return Object.keys(objValue).some((key) => {
            return Object.values(Language).includes(key as Language)
        })
    }
    return false
}

export const getHasShopifyScriptTagScopes = ({
    storeIntegration,
}: {
    storeIntegration: Integration
}) =>
    ['read_script_tags', 'write_script_tags'].every((scope) => {
        if (
            !storeIntegration ||
            storeIntegration.type !== IntegrationType.Shopify
        ) {
            return false
        }

        return storeIntegration.meta?.oauth?.scope?.includes(scope)
    })
