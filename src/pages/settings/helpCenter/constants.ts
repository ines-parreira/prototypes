import {
    LocaleCode,
    LocalSocialNavigationLink,
} from '../../../models/helpCenter/types'

export const HELP_CENTER_BASE_PATH = '/app/settings/help-center'

export const HELP_CENTER_LANGUAGE_DEFAULT: LocaleCode = 'en-US'

export const HELP_CENTER_DOMAIN = window.location.hostname.includes(
    '.gorgias.xyz'
)
    ? 'gorgias.rehab'
    : 'gorgias.help'

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
