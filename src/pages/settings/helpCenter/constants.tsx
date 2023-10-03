import React from 'react'
import InstallationStep from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationInstall/GorgiasChatIntegrationManualInstallationTabs/components/InstallationStep'
import {
    LocaleCode,
    LocalSocialNavigationLink,
} from '../../../models/helpCenter/types'
import {isProduction, isStaging} from '../../../utils/environment'
import {emojiRegex} from './utils/emojiRegex'

import {HelpCenterTheme} from './types'

export const HELP_CENTER_BASE_PATH = '/app/settings/help-center'

export const HELP_CENTER_DEFAULT_COLOR = '#4A8DF9'

export const HELP_CENTER_DEFAULT_FONT = 'Inter'

export const HELP_CENTER_AVAILABLE_FONTS = [
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

export const HELP_CENTER_DEFAULT_THEME = HelpCenterTheme.LIGHT

export const HELP_CENTER_DEFAULT_LOCALE: LocaleCode = 'en-US'

export const HELP_CENTER_DOMAIN = isProduction()
    ? '.gorgias.help'
    : isStaging()
    ? '.gorgias.rehab'
    : '.gorgias.docker:4000'

export const HELP_CENTER_MAX_ARTICLES = 1000

export const HELP_CENTER_MAX_ARTICLES_WARNING_THRESHOLD = 990

export const HELP_CENTER_MAX_CREATION = 200

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
        tooltip: 'Article settings',
    },
    {
        name: 'duplicateArticle',
        icon: 'content_copy',
        tooltip: 'Duplicate article',
    },
    {
        name: 'copyToClipboard',
        icon: 'share',
        tooltip: 'Copy link to clipboard',
    },
] as const
export type ArticleRowActionTypes = typeof ARTICLE_ROW_ACTIONS[number]['name']

export const HELP_CENTER_TITLE_MAX_LENGTH = 250

export const HELP_CENTERS_PER_PAGE = 30

export const ARTICLES_PER_PAGE = 20

export const CATEGORIES_PER_PAGE = 30

export const CATEGORY_ROW_ACTIONS = [
    {
        name: 'categorySettings',
        icon: 'settings',
        tooltip: 'Category settings',
    },
    {
        name: 'createNestedCategory',
        icon: 'playlist_add',
        tooltip: 'Create category',
    },
    {
        name: 'createNestedArticle',
        icon: 'note_add',
        tooltip: 'Create article',
    },
] as const
export type CategoryRowActionTypes = typeof CATEGORY_ROW_ACTIONS[number]['name']

export const DRAWER_TRANSITION_DURATION_MS = 300

export const EDITOR_MODAL_CONTAINER_ID = 'editor-modal-container-id'

export const EMOJI_REGEX = emojiRegex
export enum EditingStateEnum {
    PUBLISHED = 'PUBLISHED',
    UNSAVED = 'UNSAVED',
    SAVED = 'SAVED',
}
// category levels are identified from 0 to n
export const CATEGORY_TREE_MAX_LEVEL = 4
// category depth represents the total number of category levels
export const MAX_CATEGORY_DEPTH = CATEGORY_TREE_MAX_LEVEL + 1

export const CONTACT_FORM_ALERT_ACKNOWLEDGED_LOCAL_STORAGE_KEY =
    'gorgias-contact-form-alert-acknowledged'

export const HELP_CENTER_ROOT_CATEGORY_ID = 0

export enum ManuallyEmbedOptions {
    SHOPIFY = 'shopify',
    OTHER = 'other',
}
export const MANUALLY_EMBED_TABS = [
    {
        label: 'Shopify Website',
        value: ManuallyEmbedOptions.SHOPIFY,
    },
    {
        label: 'Any Other Website',
        value: ManuallyEmbedOptions.OTHER,
    },
]

export const MANUALLY_EMBED_STEPS = {
    [ManuallyEmbedOptions.SHOPIFY]: [
        <InstallationStep index={1} key="shopify_step_1">
            Go to your store's admin panel and under <b>Online Store</b>, select{' '}
            <b>Pages</b>.
        </InstallationStep>,
        <InstallationStep index={2} key="shopify_step_2">
            Select the page where you want to embed your Help Center
        </InstallationStep>,
        <InstallationStep index={3} key="shopify_step_3">
            Under the <b>Content</b> section, click{' '}
            <i className="material-icons">code</i> <b>Show HTML</b>
        </InstallationStep>,
        <InstallationStep index={4} key="shopify_step_4">
            Copy and paste the code snippet below into the container
        </InstallationStep>,
        <InstallationStep index={5} key="shopify_step_5">
            Save changes
        </InstallationStep>,
    ],
    [ManuallyEmbedOptions.OTHER]: [
        <InstallationStep index={1} key="other_step_1">
            Edit the source code of your website
        </InstallationStep>,
        <InstallationStep index={2} key="other_step_2">
            Add the code snippet anywhere between &lt;body&gt; and &lt;/body&gt;
            where you want your Help Center to be displayed on the page
        </InstallationStep>,
        <InstallationStep index={3} key="other_step_3">
            Save the file and commit changes
        </InstallationStep>,
    ],
}
