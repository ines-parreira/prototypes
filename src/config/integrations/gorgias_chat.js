import {fromJS} from 'immutable'

import {
    DANISH_LANGUAGE,
    DUTCH_LANGUAGE,
    ENGLISH_US_LANGUAGE,
    FRENCH_LANGUAGE,
    ITALIAN_LANGUAGE,
    SPANISH_LANGUAGE,
    SWEDISH_LANGUAGE,
    GERMAN_LANGUAGE,
    CZECH_LANGUAGE,
} from '../../constants/languages'

export const GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH = 50

export const GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT = ENGLISH_US_LANGUAGE
export const GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS = fromJS([
    {value: ENGLISH_US_LANGUAGE, label: 'English US'},
    {value: FRENCH_LANGUAGE, label: 'French'},
    {value: SPANISH_LANGUAGE, label: 'Spanish'},
    {value: DANISH_LANGUAGE, label: 'Danish'},
    {value: SWEDISH_LANGUAGE, label: 'Swedish'},
    {value: ITALIAN_LANGUAGE, label: 'Italian'},
    {value: DUTCH_LANGUAGE, label: 'Dutch'},
    {value: GERMAN_LANGUAGE, label: 'German'},
    {value: CZECH_LANGUAGE, label: 'Czech'},
])

export const GORGIAS_CHAT_WIDGET_TEXTS = require('../../../../../integrations/common/texts/widget_texts.json')
export const GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS =
    GORGIAS_CHAT_WIDGET_TEXTS[GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]
export const GORGIAS_CHAT_DEFAULT_COLOR = '#0d87dd'

export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL = 'optional'
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS =
    'required-outside-business-hours'
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED =
    'always-required'
export const GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT = GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL

// Auto responder
export const GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT = true

// Company picture types
export const GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS = 'team-members'
export const GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE = 'team-picture'
export const GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT = GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS

// Quick replies
export const QUICK_REPLIES_DEFAULTS = fromJS([
    'Get order status',
    'Apply promo code',
])
export const QUICK_REPLIES_MAX_ITEMS = 3
export const QUICK_REPLIES_MAX_ITEM_LENGTH = 20
