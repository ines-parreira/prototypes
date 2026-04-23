import { fn } from 'jest-mock'
import type { Mock } from 'jest-mock'

type FlagValues = Record<string, unknown>
type MockFunction<TFunction extends (...args: any[]) => any> = Mock<TFunction>

function hasFlag(flags: FlagValues, flag: string) {
    return Object.prototype.hasOwnProperty.call(flags, flag)
}

export type MockFeatureFlagsClient = {
    allFlags: MockFunction<() => FlagValues>
    variation: MockFunction<(flag: string, defaultValue?: unknown) => unknown>
}

function createFeatureFlagsClientMock(): MockFeatureFlagsClient {
    return {
        allFlags: fn<() => FlagValues>(),
        variation: fn<(flag: string, defaultValue?: unknown) => unknown>(),
    }
}

export const featureFlagsClientMock = createFeatureFlagsClientMock()

export function mockFeatureFlagsValues(flags: FlagValues = {}) {
    featureFlagsClientMock.allFlags.mockReturnValue(flags)
    featureFlagsClientMock.variation.mockImplementation(
        (flag: string, defaultValue?: unknown) =>
            hasFlag(flags, flag) ? flags[flag] : defaultValue,
    )
}

export function resetFeatureFlagsMocks() {
    Object.values(featureFlagsClientMock).forEach((mock) => {
        mock.mockReset()
    })

    mockFeatureFlagsValues({})
}

resetFeatureFlagsMocks()
