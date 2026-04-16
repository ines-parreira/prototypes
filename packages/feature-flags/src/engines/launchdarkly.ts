import { isDevelopment } from '@repo/utils'
import * as LDClient from 'launchdarkly-js-client-sdk'

import type { Engine, FlagContext } from './context'

export type LDEngine = Engine<
    LDClient.LDEvaluationDetail | undefined,
    LDClient.LDContext
> & {
    getRawClient: () => LDClient.LDClient
    getAllFlags: () => Record<string, unknown>
}

export function createEngine(): LDEngine {
    let client: LDClient.LDClient
    let ldContext: LDClient.LDContext = {}
    let ready = false
    let initializationPromise: Promise<void> | null = null

    function initialize(flagContext: FlagContext): void {
        ready = false
        initializationPromise = null
        ldContext = {}

        if (flagContext.key) {
            const developerContext = {
                developer: {
                    key: process.env.DEVELOPER_NAME ?? 'anonymous',
                },
            }

            ldContext = {
                kind: 'multi',
                user: {
                    kind: 'user',
                    key: flagContext.key,
                    ...flagContext.attributes,
                },
                ...(isDevelopment() && developerContext),
            }
        }

        try {
            client = LDClient.initialize(
                window.GORGIAS_LAUNCHDARKLY_CLIENT_ID,
                ldContext,
                { bootstrap: 'localStorage' },
            )
        } catch (err) {
            console.error(err)
        }
    }

    function getRawValue(flag: string) {
        return client?.variationDetail(flag, undefined)
    }

    function evaluate<T>(flag: string, defaultValue: T): T {
        if (!client) return defaultValue
        return client.variation(flag, defaultValue)
    }

    async function evaluateAsync<T>(flag: string, defaultValue: T): Promise<T> {
        await ensureInitialization()
        return client.variation(flag, defaultValue)
    }

    function subscribe<T>(
        flag: string,
        _defaultValue: T,
        callback: (value: T) => void,
    ): () => void {
        const event = `change:${flag}`
        if (!client) return () => {}
        client.on(event, callback)
        return () => {
            client.off(event, callback)
        }
    }

    function isReady(): boolean {
        return ready
    }

    function ensureInitialization(): Promise<void> {
        if (!client) return Promise.resolve()
        if (!initializationPromise) {
            initializationPromise = client
                .waitForInitialization(3)
                .then(() => {
                    ready = true
                })
                .catch((error) => {
                    console.error(
                        'Error during LaunchDarkly initialization',
                        error,
                    )
                    initializationPromise = null
                    throw error
                })
        }
        return initializationPromise
    }

    function getRawClient(): LDClient.LDClient {
        return client
    }

    function getContext(): LDClient.LDContext {
        return ldContext
    }

    function getAllFlags(): Record<string, unknown> {
        return client?.allFlags() ?? {}
    }

    return {
        initialize,
        getRawValue,
        evaluate,
        evaluateAsync,
        subscribe,
        isReady,
        ensureInitialization,
        getRawClient,
        getContext,
        getAllFlags,
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
    ensureInitialization,
    getRawClient,
    getContext,
    getAllFlags,
} = defaultEngine
