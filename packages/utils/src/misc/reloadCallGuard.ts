/**
 * Call state management for reload protection
 *
 * Migrated from: apps/helpdesk/src/utils/reloadCallGuard.ts
 */

type CallStateCallback = () => boolean

let isCallActiveCallback: CallStateCallback | null = null

export function registerCallStateCallback(callback: CallStateCallback) {
    isCallActiveCallback = callback
    return () => {
        isCallActiveCallback = null
    }
}

export function isCallActive(): boolean {
    if (!isCallActiveCallback) {
        return false
    }
    return isCallActiveCallback()
}
