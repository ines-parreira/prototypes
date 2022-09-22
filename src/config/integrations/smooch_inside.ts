import {fromJS, List} from 'immutable'

import {Language} from '../../constants/languages'

import {widgetTexts} from './widget'

export const SMOOCH_INSIDE_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH = 50

export const SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT = Language.EnglishUs
export const SMOOCH_INSIDE_WIDGET_LANGUAGE_OPTIONS = fromJS([
    {value: Language.EnglishUs, label: 'English US'},
    {value: Language.French, label: 'French'},
    {value: Language.Spanish, label: 'Spanish'},
    {value: Language.Danish, label: 'Danish'},
    {value: Language.Swedish, label: 'Swedish'},
    {value: Language.Italian, label: 'Italian'},
    {value: Language.Dutch, label: 'Dutch'},
    {value: Language.German, label: 'German'},
    {value: Language.Norwegian, label: 'Norwegian'},
    {value: Language.Czech, label: 'Czech'},
]) as List<any>

export const SMOOCH_INSIDE_WIDGET_TEXTS = widgetTexts
export const SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS =
    SMOOCH_INSIDE_WIDGET_TEXTS[SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT]
export const SMOOCH_INSIDE_DEFAULT_COLOR = '#0d87dd'

export const SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL = 'optional'
export const SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS =
    'required-outside-business-hours'
export const SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED =
    'always-required'
export const SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT =
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_OPTIONAL

// Campaigns
export const CAMPAIGNS_TRIGGER_KEYS = fromJS([
    {
        label: 'Business Hours',
        name: 'business_hours',
        operators: {
            during: {
                label: 'During business hours',
            },
            outside: {
                label: 'Outside business hours',
            },
        },
        value: {
            input: 'boolean',
            default: true,
        },
    },
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

// Quick replies
export const QUICK_REPLIES_DEFAULTS = fromJS([
    'Get order status',
    'Apply promo code',
])
export const QUICK_REPLIES_MAX_ITEMS = 3
export const QUICK_REPLIES_MAX_ITEM_LENGTH = 20

// Auto responder
export const SMOOCH_INSIDE_AUTO_RESPONDER_ENABLED_DEFAULT = true

// Company picture types
export const SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_MEMBERS = 'team-members'
export const SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE = 'team-picture'
export const SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_DEFAULT =
    SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_MEMBERS
