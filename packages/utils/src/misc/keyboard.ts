import { isMacOs } from './platform'

export function isSubmitShortcut(
    event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey'>,
): boolean {
    return event.key === 'Enter' && (isMacOs ? event.metaKey : event.ctrlKey)
}
