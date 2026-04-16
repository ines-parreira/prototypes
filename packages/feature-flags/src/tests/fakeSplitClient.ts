type Treatment = { treatment: string; config: string | null }

export function createFakeSplitClient(
    treatments: Record<string, Treatment> = {},
) {
    const listeners = new Map<string, Set<() => void>>()

    const Event = {
        SDK_READY: 'SDK_READY',
        SDK_READY_TIMED_OUT: 'SDK_READY_TIMED_OUT',
        SDK_UPDATE: 'SDK_UPDATE',
    }

    function on(event: string, cb: () => void) {
        if (!listeners.has(event)) listeners.set(event, new Set())
        listeners.get(event)!.add(cb)
    }

    function off(event: string, cb: () => void) {
        listeners.get(event)?.delete(cb)
    }

    function emit(event: string) {
        const cbs = listeners.get(event)
        if (cbs) {
            for (const cb of cbs) cb()
        }
    }

    return {
        Event,
        on,
        off,

        getTreatmentWithConfig(
            flag: string,
            __attributes?: unknown,
        ): Treatment {
            return treatments[flag] ?? { treatment: 'control', config: null }
        },

        _setTreatment(
            flag: string,
            treatment: string,
            config: string | null = null,
        ) {
            treatments[flag] = { treatment, config }
            emit(Event.SDK_UPDATE)
        },

        _emitReady() {
            emit(Event.SDK_READY)
        },

        _emitTimeout() {
            emit(Event.SDK_READY_TIMED_OUT)
        },
    }
}
