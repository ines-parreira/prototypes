import {LocalSocialNavigationLink} from '../../../models/helpCenter/types'

export const HELP_CENTER_BASE_PATH = '/app/settings/help-center'

export const HELP_CENTER_LANGUAGE_DEFAULT = 'en-US'

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
        position: 1,
        group: 'footer',
        meta: {
            network: 'facebook',
        },
        translation: {
            label: 'Facebook',
            value: '',
            created_datetime: '',
            updated_datetime: '',
            navigation_link_id: -1,
        },
    },
    twitter: {
        id: -2,
        position: 2,
        group: 'footer',
        meta: {
            network: 'twitter',
        },
        translation: {
            label: 'Twitter',
            value: '',
            created_datetime: '',
            updated_datetime: '',
            navigation_link_id: -2,
        },
    },
    instagram: {
        id: -3,
        position: 3,
        group: 'footer',
        meta: {
            network: 'instagram',
        },
        translation: {
            label: 'Instagram',
            value: '',
            created_datetime: '',
            updated_datetime: '',
            navigation_link_id: -3,
        },
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
