import _trim from 'lodash/trim'

/**
 * Clean error message sent from server before we display it
 */
export function stripErrorMessage(text: string): string {
    // Match all tags like [SHOPIFY] [full-refund] [STUFF-FOO-bar]
    const regex = /\[[\w-]+]/g
    const result = text.replace(regex, '')

    return _trim(result, '. ')
}
