export type TrafficType = 'account' | 'user' | 'ticket' | 'developer'

export type FlagContext = {
    key: string
    trafficType?: TrafficType
    attributes: Record<string, string | number | boolean>
}

export type Engine<TRawValue = unknown, TContext = unknown> = {
    initialize: (flagContext: FlagContext) => void
    evaluate: <T>(flag: string, defaultValue: T) => T
    evaluateAsync: <T>(flag: string, defaultValue: T) => Promise<T>
    subscribe: <T>(
        flag: string,
        defaultValue: T,
        callback: (value: T) => void,
    ) => () => void
    isReady: () => boolean
    ensureInitialization: () => Promise<void>
    getRawValue: (flag: string) => TRawValue
    getContext: () => TContext
}

export function buildFlagContext(
    user: { id: string },
    account: { id: string; domain: string },
    currentHelpdeskProductId?: string,
    currentAutomationProductId?: string,
): FlagContext {
    return {
        key: account.id.toString(),
        attributes: {
            userId: user.id.toString(),
            domain: account.domain,
            cluster: window.GORGIAS_CLUSTER ?? '',
            userImpersonated: window.USER_IMPERSONATED || false,
            ...(currentHelpdeskProductId && {
                helpdeskPriceId: currentHelpdeskProductId,
            }),
            ...(currentAutomationProductId && {
                automationPriceId: currentAutomationProductId,
            }),
        },
    }
}
