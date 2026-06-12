import type { PropsWithChildren } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { UserRole } from '@repo/permissions'
import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockGetCurrentUserHandler,
    mockGetCurrentUserResponse,
} from '@gorgias/helpdesk-mocks'

import { useStandaloneAiContext } from './StandaloneAiContext'
import { StandaloneAiProvider } from './StandaloneAiProvider'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseFlag = jest.mocked(useFlag)
const STANDALONE_AI_HELPDESK_ID = '69b020cb62b0f057d64d0307'

const server = setupServer()

const FEATURE_ACCESS_LIST = {
    statistics: { canRead: false, canWrite: false },
    userManagement: { canRead: false, canWrite: false },
    ticketsView: {
        canRead: false,
        canCreateInternalNote: false,
        canWrite: false,
    },
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
    server.use(
        mockGetCurrentUserHandler(async () =>
            HttpResponse.json(
                mockGetCurrentUserResponse({
                    role: { name: roleName as any },
                }),
            ),
        ).handler,
    )
}

function givenNoUser() {
    server.use(
        mockGetCurrentUserHandler(async () => new Promise(() => undefined))
            .handler,
    )
}

function givenAppClientId(appClientId: string | undefined) {
    Object.defineProperty(window, 'APP_CLIENT_ID', {
        configurable: true,
        writable: true,
        value: appClientId,
    })
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('StandaloneAiProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        givenAppClientId(STANDALONE_AI_HELPDESK_ID)
    })

    afterEach(() => {
        jest.restoreAllMocks()
        givenAppClientId(undefined)
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

    it('should return default access when the feature flag is enabled for a different app client id', () => {
        givenFeatureFlag(true)
        givenAppClientId('different-helpdesk-id')
        givenUserRole(UserRole.Admin)

        const { result } = renderHook(() => useStandaloneAiContext(), {
            wrapper,
        })

        expect(result.current.isStandaloneAiAgent).toBe(false)
        expect(result.current.accessFeaturesMapped).toEqual(FEATURE_ACCESS_LIST)
    })

    it('should return admin access when the feature flag is enabled for admins', async () => {
        givenFeatureFlag(true)
        givenUserRole(UserRole.Admin)

        const { result } = renderHook(() => useStandaloneAiContext(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.isStandaloneAiAgent).toBe(true)
            expect(result.current.accessFeaturesMapped).toEqual({
                statistics: { canRead: true, canWrite: true },
                userManagement: { canRead: true, canWrite: true },
                ticketsView: {
                    canRead: true,
                    canCreateInternalNote: true,
                    canWrite: false,
                },
            })
        })
    })

    it('should return agent access when the feature flag is enabled for agents', async () => {
        givenFeatureFlag(true)
        givenUserRole(UserRole.Agent)

        const { result } = renderHook(() => useStandaloneAiContext(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.isStandaloneAiAgent).toBe(true)
            expect(result.current.accessFeaturesMapped).toEqual({
                statistics: { canRead: true, canWrite: true },
                userManagement: { canRead: false, canWrite: false },
                ticketsView: {
                    canRead: true,
                    canCreateInternalNote: true,
                    canWrite: false,
                },
            })
        })
    })

    it('should return observer access when the feature flag is enabled for observer agents', async () => {
        givenFeatureFlag(true)
        givenUserRole(UserRole.ObserverAgent)

        const { result } = renderHook(() => useStandaloneAiContext(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.isStandaloneAiAgent).toBe(true)
            expect(result.current.accessFeaturesMapped).toEqual({
                statistics: { canRead: true, canWrite: false },
                userManagement: { canRead: false, canWrite: false },
                ticketsView: {
                    canRead: true,
                    canCreateInternalNote: true,
                    canWrite: false,
                },
            })
        })
    })

    it('should return default access and log an error for unsupported roles', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        givenFeatureFlag(true)
        givenUserRole('unknown-role')

        const { result } = renderHook(() => useStandaloneAiContext(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.accessFeaturesMapped).toEqual(
                FEATURE_ACCESS_LIST,
            )
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Unsupported role name',
                'unknown-role',
            )
        })
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
