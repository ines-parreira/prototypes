import { InLocalStorage, SplitFactory } from '@splitsoftware/splitio-browserjs'

import type { Engine, FlagContext } from './context'

export type HarnessContext = {
    key: string
    trafficType: string
    attributes: SplitIO.Attributes
}

export type HarnessRawValue = {
    treatment: string
    config: unknown
}

export type HarnessEngine = Engine<HarnessRawValue | null, HarnessContext>

export function normalizeFlagId(flag: string): string {
    return flag.replaceAll('.', '-')
}

export function createEngine(): HarnessEngine {
    let client: SplitIO.IClient
    let harnessAttributes: SplitIO.Attributes = {}
    let harnessContext: HarnessContext = {
        key: '',
        trafficType: 'user',
        attributes: {},
    }
    let ready = false
    let initialized = false
    let initializationPromise: Promise<void> | null = null

    function initialize(flagContext: FlagContext): void {
        ready = false
        initialized = false
        initializationPromise = null

        const sdkKey = window.HARNESS_CLIENT_SDK_KEY
        if (!sdkKey) return

        if (!flagContext.key) return

        const { trafficType: __, ...attrs } = flagContext.attributes as Record<
            string,
            string | number | boolean
        > & { trafficType?: string }
        harnessAttributes = { ...attrs, key: flagContext.key }

        const key = buildSplitKey(flagContext)
        harnessContext = {
            key,
            trafficType: flagContext.trafficType ?? 'account',
            attributes: harnessAttributes,
        }

        const factory = SplitFactory({
            core: {
                authorizationKey: sdkKey,
                key,
            },
            storage: InLocalStorage(),
        })

        client = factory.client()
        initialized = true
    }

    function getRawValue(flag: string): HarnessRawValue | null {
        if (!initialized) return null
        const id = normalizeFlagId(flag)
        const { treatment, config } = client.getTreatmentWithConfig(
            id,
            harnessAttributes,
        )
        let parsedConfig: unknown = config
        if (config !== null) {
            try {
                parsedConfig = JSON.parse(config)
            } catch {
                // keep as string
            }
        }
        return { treatment, config: parsedConfig }
    }

    function evaluate<T>(flag: string, defaultValue: T): T {
        if (!initialized) return defaultValue
        const { treatment, config } = client.getTreatmentWithConfig(
            normalizeFlagId(flag),
            harnessAttributes,
        )
        return parseTreatment(treatment, config, defaultValue)
    }

    async function evaluateAsync<T>(flag: string, defaultValue: T): Promise<T> {
        if (!initialized) return defaultValue
        await ensureInitialization()
        const { treatment, config } = client.getTreatmentWithConfig(
            normalizeFlagId(flag),
            harnessAttributes,
        )
        return parseTreatment(treatment, config, defaultValue)
    }

    function subscribe<T>(
        flag: string,
        defaultValue: T,
        callback: (value: T) => void,
    ): () => void {
        if (!initialized) return () => {}

        const handler = () => {
            const { treatment, config } = client.getTreatmentWithConfig(
                normalizeFlagId(flag),
                harnessAttributes,
            )
            callback(parseTreatment(treatment, config, defaultValue))
        }

        client.on(client.Event.SDK_UPDATE, handler)
        return () => {
            client.off(client.Event.SDK_UPDATE, handler)
        }
    }

    function isReady(): boolean {
        return ready
    }

    function getContext(): HarnessContext {
        return harnessContext
    }

    function ensureInitialization(): Promise<void> {
        if (!initializationPromise) {
            if (!initialized) {
                return Promise.resolve()
            }
            initializationPromise = new Promise<void>((resolve, reject) => {
                client.on(client.Event.SDK_READY, () => {
                    ready = true
                    resolve()
                })
                client.on(client.Event.SDK_READY_TIMED_OUT, () => {
                    initializationPromise = null
                    reject(new Error('Harness SDK initialization timed out'))
                })
            })
        }
        return initializationPromise
    }

    return {
        initialize,
        getRawValue,
        evaluate,
        evaluateAsync,
        subscribe,
        isReady,
        getContext,
        ensureInitialization,
    }
}

const defaultEngine = createEngine()

export const {
    initialize,
    getRawValue,
    evaluate,
    evaluateAsync,
    subscribe,
    isReady,
    getContext,
    ensureInitialization,
} = defaultEngine

const CONTROL_TREATMENT = 'control'

function buildSplitKey(flagContext: FlagContext): string {
    switch (flagContext.trafficType) {
        case 'user':
            return String(flagContext.attributes.userId || flagContext.key)
        case 'account':
        default:
            return flagContext.key
    }
}

function coerceValue<T>(raw: string, defaultValue: T): T {
    if (typeof defaultValue === 'boolean') {
        return (raw === 'on' || raw === 'true') as T
    }

    if (typeof defaultValue === 'number') {
        const num = Number(raw)
        return (Number.isNaN(num) ? defaultValue : num) as T
    }

    try {
        return JSON.parse(raw) as T
    } catch {
        return raw as T
    }
}

function parseTreatment<T>(
    treatment: string,
    config: string | null,
    defaultValue: T,
): T {
    if (treatment === CONTROL_TREATMENT) return defaultValue

    const raw = config ?? treatment
    return coerceValue(raw, defaultValue)
}
