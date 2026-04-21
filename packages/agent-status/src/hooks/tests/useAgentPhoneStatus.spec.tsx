import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockGetUserPhoneStatusHandler,
    mockUserPhoneStatus,
} from '@gorgias/helpdesk-mocks'

import { CALL_WRAP_UP_STATUS, ON_A_CALL_STATUS } from '../../constants'
import { useAgentPhoneStatus } from '../useAgentPhoneStatus'

const server = setupServer()
const userId = 123

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useAgentPhoneStatus', () => {
    it('returns the active call status when the agent is on a call', async () => {
        const phoneStatus = mockUserPhoneStatus({
            user_id: userId,
            phone_status: 'on-call',
        })
        const getUserPhoneStatusMock = mockGetUserPhoneStatusHandler(async () =>
            HttpResponse.json(phoneStatus),
        )

        server.use(getUserPhoneStatusMock.handler)

        const { result } = renderHook(() => useAgentPhoneStatus({ userId }))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual(phoneStatus)
        expect(result.current.agentPhoneUnavailabilityStatus).toEqual(
            ON_A_CALL_STATUS,
        )
        expect(result.current.isOnActiveCall).toBe(true)
    })

    it('returns the wrap-up status when the agent is wrapping up a call', async () => {
        const phoneStatus = mockUserPhoneStatus({
            user_id: userId,
            phone_status: 'wrapping-up',
        })
        const getUserPhoneStatusMock = mockGetUserPhoneStatusHandler(async () =>
            HttpResponse.json(phoneStatus),
        )

        server.use(getUserPhoneStatusMock.handler)

        const { result } = renderHook(() => useAgentPhoneStatus({ userId }))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.agentPhoneUnavailabilityStatus).toEqual(
            CALL_WRAP_UP_STATUS,
        )
        expect(result.current.isOnActiveCall).toBe(false)
    })

    it('returns no mapped unavailability status when the agent is off the phone', async () => {
        const phoneStatus = mockUserPhoneStatus({
            user_id: userId,
            phone_status: 'off-call',
        })
        const getUserPhoneStatusMock = mockGetUserPhoneStatusHandler(async () =>
            HttpResponse.json(phoneStatus),
        )

        server.use(getUserPhoneStatusMock.handler)

        const { result } = renderHook(() => useAgentPhoneStatus({ userId }))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.agentPhoneUnavailabilityStatus).toBeUndefined()
        expect(result.current.isOnActiveCall).toBe(false)
    })

    it('returns no mapped unavailability status when the API returns no data', async () => {
        const getUserPhoneStatusMock = mockGetUserPhoneStatusHandler(async () =>
            HttpResponse.json(null),
        )

        server.use(getUserPhoneStatusMock.handler)

        const { result } = renderHook(() => useAgentPhoneStatus({ userId }))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toBeNull()
        expect(result.current.agentPhoneUnavailabilityStatus).toBeUndefined()
        expect(result.current.isOnActiveCall).toBe(false)
    })

    it('does not issue a request when the query is disabled', async () => {
        const { result } = renderHook(() =>
            useAgentPhoneStatus({
                userId,
                enabled: false,
            }),
        )

        expect(result.current.data).toBeUndefined()
        expect(result.current.agentPhoneUnavailabilityStatus).toBeUndefined()
        expect(result.current.isOnActiveCall).toBe(false)
    })

    it('does not issue a request when running in cacheOnly mode', async () => {
        const { result } = renderHook(() =>
            useAgentPhoneStatus({
                userId,
                cacheOnly: true,
            }),
        )

        expect(result.current.data).toBeUndefined()
        expect(result.current.agentPhoneUnavailabilityStatus).toBeUndefined()
        expect(result.current.isOnActiveCall).toBe(false)
    })
})
