import { useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { UserRole } from '@repo/utils'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { useStandaloneAiAccess } from '../useStandaloneAiAccess'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { AiStandaloneAgent: 'AiStandaloneAgent' },
    useFlag: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetCurrentUser: jest.fn(),
}))

const mockUseFlag = jest.mocked(useFlag)
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser)

const FEATURE_ACCESS_LIST = {
    statistics: { canRead: false, canWrite: false },
}

function givenFeatureFlag(value: boolean) {
    mockUseFlag.mockReturnValue(value)
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

beforeEach(() => {
    jest.clearAllMocks()
})

describe('useStandaloneAiAccess', () => {
    describe('when feature flag is off', () => {
        it('should return default access list and isStandaloneAiAgent as false', () => {
            givenFeatureFlag(false)
            givenUserRole(UserRole.Admin)

            const { result } = renderHook(() => useStandaloneAiAccess())

            expect(result.current.accessFeaturesMapped).toEqual(
                FEATURE_ACCESS_LIST,
            )
            expect(result.current.isStandaloneAiAgent).toBe(false)
        })
    })

    describe('when feature flag is on', () => {
        beforeEach(() => {
            givenFeatureFlag(true)
        })

        it('should return isStandaloneAiAgent as true', () => {
            givenUserRole(UserRole.Admin)

            const { result } = renderHook(() => useStandaloneAiAccess())

            expect(result.current.isStandaloneAiAgent).toBe(true)
        })

        it('should grant full statistics access for Admin role', () => {
            givenUserRole(UserRole.Admin)

            const { result } = renderHook(() => useStandaloneAiAccess())

            expect(result.current.accessFeaturesMapped).toEqual({
                statistics: { canRead: true, canWrite: true },
            })
        })

        it('should grant full statistics access for Agent role', () => {
            givenUserRole(UserRole.Agent)

            const { result } = renderHook(() => useStandaloneAiAccess())

            expect(result.current.accessFeaturesMapped).toEqual({
                statistics: { canRead: true, canWrite: true },
            })
        })

        it('should grant read-only statistics access for ObserverAgent role', () => {
            givenUserRole(UserRole.ObserverAgent)

            const { result } = renderHook(() => useStandaloneAiAccess())

            expect(result.current.accessFeaturesMapped).toEqual({
                statistics: { canRead: true, canWrite: false },
            })
        })

        it('should return default access list and log error for unsupported role', () => {
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})
            givenUserRole('unknown-role')

            const { result } = renderHook(() => useStandaloneAiAccess())

            expect(result.current.accessFeaturesMapped).toEqual(
                FEATURE_ACCESS_LIST,
            )
            expect(consoleSpy).toHaveBeenCalledWith(
                'Unsupported role name',
                'unknown-role',
            )

            consoleSpy.mockRestore()
        })

        it('should return default access list when user data is not yet loaded', () => {
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})
            givenNoUser()

            const { result } = renderHook(() => useStandaloneAiAccess())

            expect(result.current.accessFeaturesMapped).toEqual(
                FEATURE_ACCESS_LIST,
            )

            consoleSpy.mockRestore()
        })
    })
})
