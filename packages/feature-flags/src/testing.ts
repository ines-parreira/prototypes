import { fn } from 'jest-mock'
import type { Mock } from 'jest-mock'

type LDFlags = Record<string, unknown>
type MockFunction<TFunction extends (...args: any[]) => any> = Mock<TFunction>

function hasFlag(flags: LDFlags, flag: string) {
    return Object.prototype.hasOwnProperty.call(flags, flag)
}

export type MockLDClient = {
    track: MockFunction<(...args: unknown[]) => void>
    identify: MockFunction<(...args: unknown[]) => void>
    allFlags: MockFunction<() => LDFlags>
    close: MockFunction<() => void>
    flush: MockFunction<() => Promise<void>>
    getContext: MockFunction<() => unknown>
    off: MockFunction<
        (event: string, listener?: (...args: unknown[]) => void) => void
    >
    on: MockFunction<
        (event: string, listener: (...args: unknown[]) => void) => void
    >
    setStreaming: MockFunction<(isEnabled: boolean) => void>
    variation: MockFunction<(flag: string, defaultValue?: unknown) => unknown>
    variationDetail: MockFunction<(...args: unknown[]) => unknown>
    waitForInitialization: MockFunction<(timeout?: number) => Promise<void>>
    waitUntilGoalsReady: MockFunction<() => Promise<void>>
    waitUntilReady: MockFunction<() => Promise<void>>
}

function createLDClientMock(): MockLDClient {
    return {
        track: fn<(...args: unknown[]) => void>(),
        identify: fn<(...args: unknown[]) => void>(),
        allFlags: fn<() => LDFlags>(),
        close: fn<() => void>(),
        flush: fn<() => Promise<void>>().mockResolvedValue(undefined),
        getContext: fn<() => unknown>(),
        off: fn<
            (event: string, listener?: (...args: unknown[]) => void) => void
        >(),
        on: fn<
            (event: string, listener: (...args: unknown[]) => void) => void
        >(),
        setStreaming: fn<(isEnabled: boolean) => void>(),
        variation: fn<(flag: string, defaultValue?: unknown) => unknown>(),
        variationDetail: fn<(...args: unknown[]) => unknown>(),
        waitForInitialization:
            fn<(timeout?: number) => Promise<void>>().mockResolvedValue(
                undefined,
            ),
        waitUntilGoalsReady:
            fn<() => Promise<void>>().mockResolvedValue(undefined),
        waitUntilReady: fn<() => Promise<void>>().mockResolvedValue(undefined),
    }
}

export const ldClientMock = createLDClientMock()

export function mockLaunchDarklyFlags(flags: LDFlags = {}) {
    ldClientMock.allFlags.mockReturnValue(flags)
    ldClientMock.variation.mockImplementation(
        (flag: string, defaultValue?: unknown) =>
            hasFlag(flags, flag) ? flags[flag] : defaultValue,
    )
}

export function resetLDMocks() {
    Object.values(ldClientMock).forEach((mock) => {
        mock.mockReset()
    })

    ldClientMock.flush.mockResolvedValue(undefined)
    ldClientMock.waitForInitialization.mockResolvedValue(undefined)
    ldClientMock.waitUntilGoalsReady.mockResolvedValue(undefined)
    ldClientMock.waitUntilReady.mockResolvedValue(undefined)
    mockLaunchDarklyFlags({})
}

resetLDMocks()
