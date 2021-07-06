export const HELP_CENTER_BASE_PATH = '/app/settings/help-center'

export const HELP_CENTER_LANGUAGE_DEFAULT = 'en-US'

export const HELP_CENTER_DOMAIN = window.location.hostname.includes(
    '.gorgias.xyz'
)
    ? 'gorgias.rehab'
    : 'gorgias.help'

export const SOCIAL_NAVIGATION_LINKS = ['facebook', 'twitter', 'instagram']

// 5Mb
export const MAX_IMAGE_SIZE = 5 * 1000 * 1000
