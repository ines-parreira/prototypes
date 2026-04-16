export function createFakeLDClient(flags: Record<string, unknown> = {}) {
    const listeners = new Map<string, Set<(...args: unknown[]) => void>>()
    let resolveInit: () => void
    let rejectInit: (err: Error) => void
    let initPromise: Promise<void>

    function resetInitPromise() {
        initPromise = new Promise<void>((resolve, reject) => {
            resolveInit = resolve
            rejectInit = reject
        })
    }
    resetInitPromise()

    return {
        variation(flag: string, defaultValue: unknown) {
            return flag in flags ? flags[flag] : defaultValue
        },

        variationDetail(flag: string, defaultValue: unknown) {
            if (!(flag in flags))
                return {
                    value: defaultValue,
                    variationIndex: null,
                    reason: null,
                }
            return {
                value: flags[flag],
                variationIndex: 0,
                reason: { kind: 'FALLTHROUGH' },
            }
        },

        allFlags() {
            return { ...flags }
        },

        waitForInitialization() {
            return initPromise
        },

        on(event: string, cb: (...args: unknown[]) => void) {
            if (!listeners.has(event)) listeners.set(event, new Set())
            listeners.get(event)!.add(cb)
        },

        off(event: string, cb: (...args: unknown[]) => void) {
            listeners.get(event)?.delete(cb)
        },

        _setFlag(flag: string, value: unknown) {
            flags[flag] = value
            const cbs = listeners.get(`change:${flag}`)
            if (cbs) {
                for (const cb of cbs) cb(value)
            }
        },

        _resolveInit() {
            resolveInit()
        },

        _rejectInit(err: Error) {
            rejectInit(err)
            resetInitPromise()
        },
    }
}
