import {fromJS, List} from 'immutable'

import {
    DANISH_LANGUAGE,
    DUTCH_LANGUAGE,
    ENGLISH_US_LANGUAGE,
    FRENCH_FR_LANGUAGE,
    FRENCH_CA_LANGUAGE,
    ITALIAN_LANGUAGE,
    SPANISH_LANGUAGE,
    SWEDISH_LANGUAGE,
    GERMAN_LANGUAGE,
    CZECH_LANGUAGE,
    NORWEGIAN_LANGUAGE,
} from '../../constants/languages'
import {
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
} from '../../models/integration/types'

import gorgiasChatSSPTexts from './ssp_texts.json'
import {widgetTexts} from './widget'

export const GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH = 50

export const GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT = ENGLISH_US_LANGUAGE
export const GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS: List<Map<string, string>> =
    fromJS([
        {value: ENGLISH_US_LANGUAGE, label: 'English (US)'},
        {value: FRENCH_FR_LANGUAGE, label: 'French (France)'},
        {value: FRENCH_CA_LANGUAGE, label: 'French (Canada)'},
        {value: SPANISH_LANGUAGE, label: 'Spanish'},
        {value: DANISH_LANGUAGE, label: 'Danish'},
        {value: SWEDISH_LANGUAGE, label: 'Swedish'},
        {value: ITALIAN_LANGUAGE, label: 'Italian'},
        {value: DUTCH_LANGUAGE, label: 'Dutch'},
        {value: GERMAN_LANGUAGE, label: 'German'},
        {value: NORWEGIAN_LANGUAGE, label: 'Norwegian'},
        {value: CZECH_LANGUAGE, label: 'Czech'},
    ])

export const GORGIAS_CHAT_WIDGET_TEXTS: {
    [locale: string]: {[key: string]: string}
} = widgetTexts
export const GORGIAS_CHAT_SSP_TEXTS: {
    [locale: string]: {[key: string]: string}
} = gorgiasChatSSPTexts
export const GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS =
    GORGIAS_CHAT_WIDGET_TEXTS[GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]
export const GORGIAS_CHAT_DEFAULT_COLOR = '#0d87dd'

export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL = 'optional'
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS =
    'required-outside-business-hours'
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED =
    'always-required'
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT =
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL

export const GORGIAS_CHAT_CONTACT_FORM_ENABLED_DEFAULT = true
export const GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT = null

// Auto responder
export const GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT = true

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
    {value: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT, label: 'Bottom left'},
    {value: GorgiasChatPositionAlignmentEnum.TOP_RIGHT, label: 'Top right'},
    {value: GorgiasChatPositionAlignmentEnum.TOP_LEFT, label: 'Top left'},
])

// Quick replies
export const QUICK_REPLIES_DEFAULTS = fromJS([
    'Get order status',
    'Apply promo code',
])
export const QUICK_REPLIES_MAX_ITEMS = 3
export const QUICK_REPLIES_MAX_ITEM_LENGTH = 20

// Campaigns
export const CAMPAIGNS_TRIGGER_KEYS = fromJS([
    {
        label: 'Current URL',
        name: 'current_url',
        operators: {
            eq: {
                label: 'is',
            },
            neq: {
                label: 'is not',
            },
            contains: {
                label: 'contains',
            },
            notContains: {
                label: 'does not contain',
            },
            startsWith: {
                label: 'starts with',
            },
            endsWith: {
                label: 'ends with',
            },
        },
        value: {
            input: 'text',
            default: '',
        },
    },
    {
        label: 'Time spent on page',
        name: 'time_spent_on_page',
        operators: {
            gt: {
                label: 'is greater than',
            },
        },
        value: {
            input: 'number',
            default: 0,
        },
    },
])
