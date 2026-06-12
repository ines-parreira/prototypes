import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { POSITIONS } from 'reapop'

import { mockCancelJobHandler } from '@gorgias/helpdesk-mocks'

import { notify } from 'state/notifications/actions'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'

import { useCancelJob } from '../useCancelJob'

jest.mock('reapop')

jest.mock('state/notifications/actions')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    useAppDispatch: () => mockedDispatch,
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

const notificationPayload = {
    id: 'id',
    buttons: [],
    allowHTML: false,
    closeButton: false,
    closeOnNext: true,
    dismissAfter: 10000,
    dismissible: true,
    message: 'Job launched',
    position: POSITIONS.topCenter,
    status: NotificationStatus.Loading,
    style: NotificationStyle.Alert as const,
}

function renderUseCancelJob() {
    return renderHook(() =>
        useCancelJob({
            getNotificationPayload: () => notificationPayload,
        }),
    )
}

describe('useCancelJob', () => {
    it('should successfully cancel job', async () => {
        const cancelJobMock = mockCancelJobHandler()
        const waitForCancelJobRequest = cancelJobMock.waitForRequest(server)
        server.use(cancelJobMock.handler)
        const { result } = renderUseCancelJob()

        result.current.cancelJob({ id: 1 })

        await waitForCancelJobRequest((request) => {
            expect(new URL(request.url).pathname).toContain('/jobs/1')
        })
        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'The job has been canceled.',
                    status: NotificationStatus.Success,
                }),
            )
        })
    })

    it('should handle failure on job cancellation', async () => {
        server.use(
            mockCancelJobHandler(async () =>
                HttpResponse.json({ error: { msg: 'Unauthorized' } } as never, {
                    status: 403,
                }),
            ).handler,
        )
        const { result } = renderUseCancelJob()

        result.current.cancelJob({ id: 1 })

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Unauthorized',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })
})
