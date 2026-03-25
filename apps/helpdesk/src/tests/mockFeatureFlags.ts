import type { FeatureFlagsMap } from '@repo/feature-flags'
import { useFlag, useFlagWithLoading } from '@repo/feature-flags'
import {
    ldClientMock,
    mockLaunchDarklyFlags,
} from '@repo/feature-flags/testing'
import { assumeMock } from '@repo/testing'

const useFlagMock = assumeMock(useFlag)
const useFlagWithLoadingMock = assumeMock(useFlagWithLoading)

function getMockedFlagValue<T>(flag: string, defaultValue: T): T {
    const flags = ldClientMock.allFlags() ?? {}

    if (Object.prototype.hasOwnProperty.call(flags, flag)) {
        return flags[flag] as T
    }

    return ldClientMock.variation(flag, defaultValue) as T
}

export function mockFeatureFlags(flags: Partial<FeatureFlagsMap> = {}) {
    mockLaunchDarklyFlags(flags)

    useFlagMock.mockImplementation(
        <T>(flag: string, defaultValue: T = false as T) =>
            getMockedFlagValue(flag, defaultValue),
    )

    useFlagWithLoadingMock.mockImplementation(
        <T>(flag: string, defaultValue: T = false as T) => ({
            value: getMockedFlagValue(flag, defaultValue),
            isLoading: false,
        }),
    )
}
