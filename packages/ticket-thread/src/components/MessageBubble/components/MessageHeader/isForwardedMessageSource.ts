import { isObject } from '@gorgias/toolkit'

export function isForwardedMessageSource(source?: { extra?: unknown } | null) {
    const extra = source?.extra

    return isObject(extra) && 'forward' in extra && extra.forward === true
}
