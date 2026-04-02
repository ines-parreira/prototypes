import type { PropsWithChildren } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { UserRole } from '@repo/utils'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { useStandaloneAiContext } from './StandaloneAiContext'
import { StandaloneAiProvider } from './StandaloneAiProvider'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetCurrentUser: jest.fn(),
}))

const mockUseFlag = jest.mocked(useFlag)
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser)

const FEATURE_ACCESS_LIST = {
    statistics: { canRead: false, canWrite: false },
    userManagement: { canRead: false, canWrite: false },
}

const wrapper = ({ children }: PropsWithChildren) => (
    <StandaloneAiProvider>{children}</StandaloneAiProvider>
)

function givenFeatureFlag(value: boolean) {
    mockUseFlag.mockImplementation((key, defaultValue) =>
        key === FeatureFlagKey.AiStandaloneAgent ? value : defaultValue,
    )
}

function givenUserRole(roleName: string) {
    mockUseGetCurrentUser.mockReturnValue({
        data: { data: { role: { name: roleName } } },
    } as ReturnType<typeof useGetCurrentUser>)
}

function givenNoUser() {
    mockUseGetCurrentUser.mockReturnValue({
        data: undefined,
    } as ReturnType<typeof useGetCurrentUser>)
}

describe('StandaloneAiProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should throw when the context hook is used outside the provider', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {})

        expect(() => renderHook(() => useStandaloneAiContext())).toThrow(
            'useStandaloneAiContext must be used within a StandaloneAiProvider',
        )
    })

    it('should return default access when the feature flag is disabled', () => {
        givenFeatureFlag(false)
        givenUserRole(UserRole.Admin)

        const { result } = renderHook(() => useStandaloneAiContext(), {
            wrapper,
        })

        expect(result.current.isStandaloneAiAgent).toBe(false)
        expect(result.current.accessFeaturesMapped).toEqual(FEATURE_ACCESS_LIST)
    })

    it('should return admin access when the feature flag is enabled for admins', () => {
        givenFeatureFlag(true)
        givenUserRole(UserRole.Admin)

        const { result } = renderHook(() => useStandaloneAiContext(), {
            wrapper,
        })

        expect(result.current.isStandaloneAiAgent).toBe(true)
        expect(result.current.accessFeaturesMapped).toEqual({
            statistics: { canRead: true, canWrite: true },
            userManagement: { canRead: true, canWrite: true },
        })
    })

    it('should return default access and log an error for unsupported roles', () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        givenFeatureFlag(true)
        givenUserRole('unknown-role')

        const { result } = renderHook(() => useStandaloneAiContext(), {
            wrapper,
        })

        expect(result.current.accessFeaturesMapped).toEqual(FEATURE_ACCESS_LIST)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Unsupported role name',
            'unknown-role',
        )
    })

    it('should return default access when the user is not loaded yet', () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        givenFeatureFlag(true)
        givenNoUser()

        const { result } = renderHook(() => useStandaloneAiContext(), {
            wrapper,
        })

        expect(result.current.isStandaloneAiAgent).toBe(true)
        expect(result.current.accessFeaturesMapped).toEqual(FEATURE_ACCESS_LIST)
        expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
})
