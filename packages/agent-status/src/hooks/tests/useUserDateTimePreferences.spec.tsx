import { DateFormatType, DurationInMs, TimeFormatType } from '@repo/utils'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'
import * as helpdeskQueries from '@gorgias/helpdesk-queries'
import type { User } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useUserDateTimePreferences } from '../useUserDateTimePreferences'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueries>(
        '@gorgias/helpdesk-queries',
    )
    return {
        ...actual,
        useGetCurrentUser: vi.fn(),
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

describe('useUserDateTimePreferences', () => {
    describe('integration', () => {
        it('fetches and returns user date time preferences', async () => {
            const actual = await vi.importActual<typeof helpdeskQueries>(
                '@gorgias/helpdesk-queries',
            )
            vi.mocked(helpdeskQueries.useGetCurrentUser).mockImplementation(
                actual.useGetCurrentUser,
            )
            const MOCK_FORMATTING_DATA = {
                date_format: DateFormatType.en_GB,
                time_format: TimeFormatType.TwentyFourHour,
            }

            const user = mockUser({
                id: 1,
                email: 'agent@example.com',
                settings: [
                    {
                        type: 'preferences',
                        data: MOCK_FORMATTING_DATA,
                    },
                ],
            } as User)

            const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
                HttpResponse.json(user),
            )

            server.use(mockGetCurrentUser.handler)

            const { result } = renderHook(() => useUserDateTimePreferences({}))

            await waitFor(() => {
                expect(result.current.dateFormat).toBe(
                    MOCK_FORMATTING_DATA.date_format,
                )
                expect(result.current.timeFormat).toBe(
                    MOCK_FORMATTING_DATA.time_format,
                )
            })
        })

        it('returns defaults when user has no preferences', async () => {
            const actual = await vi.importActual<typeof helpdeskQueries>(
                '@gorgias/helpdesk-queries',
            )
            vi.mocked(helpdeskQueries.useGetCurrentUser).mockImplementation(
                actual.useGetCurrentUser,
            )

            const user = mockUser({
                id: 1,
                email: 'agent@example.com',
                settings: [],
            } as User)

            const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
                HttpResponse.json(user),
            )

            server.use(mockGetCurrentUser.handler)

            const { result } = renderHook(() => useUserDateTimePreferences({}))

            await waitFor(() => {
                expect(result.current.dateFormat).toBe(DateFormatType.en_US)
                expect(result.current.timeFormat).toBe(TimeFormatType.AmPm)
            })
        })
    })

    describe('cache configuration', () => {
        it('passes correct default staleTime and cacheTime', () => {
            vi.mocked(helpdeskQueries.useGetCurrentUser).mockReturnValue({
                data: {
                    data: mockUser({
                        id: 1,
                        email: 'agent@example.com',
                        settings: [],
                    } as User),
                },
            } as any)

            renderHook(() => useUserDateTimePreferences({}))

            expect(helpdeskQueries.useGetCurrentUser).toHaveBeenCalledWith({
                query: {
                    staleTime: DurationInMs.OneDay,
                    cacheTime: DurationInMs.OneDay,
                    enabled: true,
                },
            })
        })

        it('passes custom staleTime and cacheTime when provided', () => {
            vi.mocked(helpdeskQueries.useGetCurrentUser).mockReturnValue({
                data: {
                    data: mockUser({
                        id: 1,
                        email: 'agent@example.com',
                        settings: [],
                    } as User),
                },
            } as any)

            const customStaleTime = DurationInMs.OneHour
            const customCacheTime = DurationInMs.FiveMinutes

            renderHook(() =>
                useUserDateTimePreferences({
                    staleTime: customStaleTime,
                    cacheTime: customCacheTime,
                    enabled: false,
                }),
            )

            expect(helpdeskQueries.useGetCurrentUser).toHaveBeenCalledWith({
                query: {
                    staleTime: customStaleTime,
                    cacheTime: customCacheTime,
                    enabled: false,
                },
            })
        })
    })
})
