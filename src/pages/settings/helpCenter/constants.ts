import {
    LocaleCode,
    LocalSocialNavigationLink,
} from '../../../models/helpCenter/types'
import {isProduction} from '../../../utils/environment'

import {HelpCenterThemes} from './types'

export const HELP_CENTER_BASE_PATH = '/app/settings/help-center'

export const HELP_CENTER_DEFAULT_COLOR = '#4A8DF9'

export const DEFAULT_THEME = HelpCenterThemes.LIGHT

export const HELP_CENTER_LANGUAGE_DEFAULT: LocaleCode = 'en-US'

export const HELP_CENTER_DOMAIN = isProduction()
    ? '.gorgias.help'
    : '.gorgias.rehab'

export const SOCIAL_NAVIGATION_LINKS: Record<
    string,
    LocalSocialNavigationLink
> = {
    facebook: {
        id: -1,
        label: 'Facebook',
        value: '',
        group: 'footer',
        meta: {
            network: 'facebook',
        },
        created_datetime: '',
        updated_datetime: '',
    },
    twitter: {
        id: -2,
        label: 'Twitter',
        value: '',
        group: 'footer',
        meta: {
            network: 'twitter',
        },
        created_datetime: '',
        updated_datetime: '',
    },
    instagram: {
        id: -3,
        label: 'Instagram',
        value: '',
        group: 'footer',
        meta: {
            network: 'instagram',
        },
        created_datetime: '',
        updated_datetime: '',
    },
}

// 5Mb
export const MAX_IMAGE_SIZE = 5 * 1000 * 1000

export enum MODALS {
    CATEGORY = 'CATEGORY',
    ARTICLE = 'ARTICLE',
}

export const ARTICLE_ROW_ACTIONS = [
    {
        name: 'articleSettings',
        icon: 'settings',
        // tooltip: 'Article settings',
    },
    {
        name: 'duplicateArticle',
        icon: 'content_copy',
    },
    {
        name: 'copyToClipboard',
        icon: 'link',
    },
]

export const CATEGORIES_PER_PAGE = 30
