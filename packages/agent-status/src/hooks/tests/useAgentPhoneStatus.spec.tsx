import { DurationInMs } from '@repo/utils'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetUserPhoneStatusHandler,
    mockUserPhoneStatus,
} from '@gorgias/helpdesk-mocks'
import * as helpdeskQueries from '@gorgias/helpdesk-queries'

import { CALL_WRAP_UP_STATUS, ON_A_CALL_STATUS } from '../../constants'
import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useAgentPhoneStatus } from '../useAgentPhoneStatus'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueries>(
        '@gorgias/helpdesk-queries',
    )
    return {
        ...actual,
        useGetUserPhoneStatus: vi.fn(),
    }
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    vi.clearAllMocks()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const MOCK_USER_ID = 123

describe('useAgentPhoneStatus', () => {
    describe('integration', () => {
        it('fetches and returns phone status data', async () => {
            const actual = await vi.importActual<typeof helpdeskQueries>(
                '@gorgias/helpdesk-queries',
            )
            vi.mocked(helpdeskQueries.useGetUserPhoneStatus).mockImplementation(
                actual.useGetUserPhoneStatus,
            )

            const mockPhoneStatus = mockUserPhoneStatus({
                user_id: MOCK_USER_ID,
                phone_status: 'on-call',
            })

            const mockGetUserPhoneStatus = mockGetUserPhoneStatusHandler(
                async () => HttpResponse.json(mockPhoneStatus),
            )

            server.use(mockGetUserPhoneStatus.handler)

            const { result } = renderHook(() =>
                useAgentPhoneStatus({ userId: MOCK_USER_ID }),
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.data).toEqual(mockPhoneStatus)
            expect(result.current.isError).toBe(false)
        })
    })

    describe('parameter passing', () => {
        it('passes correct default parameters', () => {
            vi.mocked(helpdeskQueries.useGetUserPhoneStatus).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
            } as unknown as ReturnType<
                typeof helpdeskQueries.useGetUserPhoneStatus
            >)

            renderHook(() =>
                useAgentPhoneStatus({
                    userId: MOCK_USER_ID,
                }),
            )

            expect(helpdeskQueries.useGetUserPhoneStatus).toHaveBeenCalledWith(
                MOCK_USER_ID,
                {
                    query: {
                        enabled: true,
                        select: expect.any(Function),
                        staleTime: DurationInMs.OneMinute,
                        cacheTime: DurationInMs.OneHour,
                    },
                },
            )
        })

        it('passes custom parameters when provided', () => {
            vi.mocked(helpdeskQueries.useGetUserPhoneStatus).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
            } as any)

            const customStaleTime = DurationInMs.ThirtyMinutes
            const customCacheTime = DurationInMs.FifteenMinutes

            renderHook(() =>
                useAgentPhoneStatus({
                    userId: MOCK_USER_ID,
                    staleTime: customStaleTime,
                    cacheTime: customCacheTime,
                    enabled: false,
                }),
            )

            expect(helpdeskQueries.useGetUserPhoneStatus).toHaveBeenCalledWith(
                MOCK_USER_ID,
                {
                    query: {
                        enabled: false,
                        select: expect.any(Function),
                        staleTime: customStaleTime,
                        cacheTime: customCacheTime,
                    },
                },
            )
        })

        it('disables query and sets staleTime to Infinity when cacheOnly is true', () => {
            vi.mocked(helpdeskQueries.useGetUserPhoneStatus).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
            } as unknown as ReturnType<
                typeof helpdeskQueries.useGetUserPhoneStatus
            >)

            renderHook(() =>
                useAgentPhoneStatus({
                    userId: MOCK_USER_ID,
                    cacheOnly: true,
                }),
            )

            expect(helpdeskQueries.useGetUserPhoneStatus).toHaveBeenCalledWith(
                MOCK_USER_ID,
                {
                    query: {
                        enabled: false,
                        select: expect.any(Function),
                        staleTime: Infinity,
                        cacheTime: DurationInMs.OneHour,
                    },
                },
            )
        })
    })

    describe('agentPhoneStatus mapping', () => {
        beforeEach(async () => {
            const actual = await vi.importActual<typeof helpdeskQueries>(
                '@gorgias/helpdesk-queries',
            )
            vi.mocked(helpdeskQueries.useGetUserPhoneStatus).mockImplementation(
                actual.useGetUserPhoneStatus,
            )
        })

        it('maps "on-call" to AVAILABLE_STATUS', async () => {
            const mockPhoneStatus = mockUserPhoneStatus({
                user_id: MOCK_USER_ID,
                phone_status: 'on-call',
            })

            const mockGetUserPhoneStatus = mockGetUserPhoneStatusHandler(
                async () => HttpResponse.json(mockPhoneStatus),
            )

            server.use(mockGetUserPhoneStatus.handler)

            const { result } = renderHook(() =>
                useAgentPhoneStatus({ userId: MOCK_USER_ID }),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.agentPhoneUnavailabilityStatus).toEqual(
                ON_A_CALL_STATUS,
            )
        })

        it('maps "wrapping-up" to CALL_WRAP_UP_STATUS', async () => {
            const mockPhoneStatus = mockUserPhoneStatus({
                user_id: MOCK_USER_ID,
                phone_status: 'wrapping-up',
            })

            const mockGetUserPhoneStatus = mockGetUserPhoneStatusHandler(
                async () => HttpResponse.json(mockPhoneStatus),
            )

            server.use(mockGetUserPhoneStatus.handler)

            const { result } = renderHook(() =>
                useAgentPhoneStatus({ userId: MOCK_USER_ID }),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.agentPhoneUnavailabilityStatus).toEqual(
                CALL_WRAP_UP_STATUS,
            )
        })

        it('returns undefined for unmapped phone statuses', async () => {
            const mockPhoneStatus = mockUserPhoneStatus({
                user_id: MOCK_USER_ID,
                phone_status: 'off-call',
            })

            const mockGetUserPhoneStatus = mockGetUserPhoneStatusHandler(
                async () => HttpResponse.json(mockPhoneStatus),
            )

            server.use(mockGetUserPhoneStatus.handler)

            const { result } = renderHook(() =>
                useAgentPhoneStatus({ userId: MOCK_USER_ID }),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(
                result.current.agentPhoneUnavailabilityStatus,
            ).toBeUndefined()
        })

        it('returns undefined when API returns no data', async () => {
            const mockGetUserPhoneStatus = mockGetUserPhoneStatusHandler(
                async () => HttpResponse.json(null),
            )

            server.use(mockGetUserPhoneStatus.handler)

            const { result } = renderHook(() =>
                useAgentPhoneStatus({ userId: MOCK_USER_ID }),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(
                result.current.agentPhoneUnavailabilityStatus,
            ).toBeUndefined()
        })
    })
})
