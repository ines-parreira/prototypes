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
