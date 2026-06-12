import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { notify as updateNotification } from 'reapop'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockCreateJobHandler,
    mockCreateJobResponse,
} from '@gorgias/helpdesk-mocks'
import { JobType, ViewType } from '@gorgias/helpdesk-types'

import { view } from 'fixtures/views'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'

import { useBulkAction } from '../useBulkAction'
import { useCancelJob } from '../useCancelJob'
import { useNotificationPayload } from '../useNotificationPayload'

jest.mock('reapop')
const updateNotificationMock = assumeMock(updateNotification)

jest.mock('../useCancelJob')
const useCancelJobMock = assumeMock(useCancelJob)

jest.mock('../useNotificationPayload')
const useNotificationPayloadMock = assumeMock(useNotificationPayload)

jest.mock('state/notifications/actions')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    useAppDispatch: () => mockedDispatch,
}))

const mutateCancelJobMock = jest.fn()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { with_highlights, ...viewFixture } = view
const defaultState = {
    views: fromJS({
        active: {
            ...viewFixture,
            type: ViewType.TicketList,
        },
    }),
} as unknown as RootState
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
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

function createWrapper(state: Partial<RootState> = defaultState) {
    return ({ children }: { children?: React.ReactNode }) => (
        <Provider store={mockStore(state)}>{children}</Provider>
    )
}

function mockCreateJob(responseId = 123) {
    const createJobMock = mockCreateJobHandler(async () =>
        HttpResponse.json(mockCreateJobResponse({ id: responseId })),
    )
    const waitForCreateJobRequest = createJobMock.waitForRequest(server)
    server.use(createJobMock.handler)

    return waitForCreateJobRequest
}

describe('useBulkAction', () => {
    const statusMock = 'jobStatus'
    const getNotificationParamsMock = jest.fn()
    const getNotificationPayloadMock = jest.fn().mockReturnValue({
        status: statusMock,
        message: 'Job is launched',
    })

    beforeEach(() => {
        useCancelJobMock.mockReturnValue({
            cancelJob: mutateCancelJobMock,
        } as unknown as ReturnType<typeof useCancelJob>)
        useNotificationPayloadMock.mockReturnValue({
            getNotificationParams: getNotificationParamsMock,
            getNotificationPayload: getNotificationPayloadMock,
        } as unknown as ReturnType<typeof useNotificationPayload>)
    })

    it('should generate a notification for a singular ticket', () => {
        renderHook(() => useBulkAction('ticket', [1]), {
            wrapper: createWrapper(),
        })

        expect(useNotificationPayloadMock).toHaveBeenCalledWith(
            expect.objectContaining({
                objectType: 'ticket',
            }),
        )
    })

    it('should generate a notification for multiple tickets', () => {
        renderHook(() => useBulkAction('ticket', [1, 2]), {
            wrapper: createWrapper(),
        })

        expect(useNotificationPayloadMock).toHaveBeenCalledWith(
            expect.objectContaining({
                objectType: 'tickets',
            }),
        )
    })

    it('should create job for a non-dirty view', async () => {
        const waitForCreateJobRequest = mockCreateJob()
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitForCreateJobRequest(async (request) => {
            expect(await request.json()).toEqual(
                expect.objectContaining({
                    params: {
                        view_id: view.id,
                    },
                    type: JobType.DeleteTicket,
                    scheduled_datetime: expect.any(String),
                }),
            )
        })
    })

    it('should create job for a dirty view', async () => {
        const waitForCreateJobRequest = mockCreateJob()
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper({
                views: fromJS({
                    active: {
                        ...viewFixture,
                        dirty: true,
                        type: ViewType.TicketList,
                    },
                }),
            } as unknown as RootState),
        })

        result.current.createJob(JobType.DeleteTicket)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, slug, uri, ...viewParam } = viewFixture

        await waitForCreateJobRequest(async (request) => {
            expect(await request.json()).toEqual(
                expect.objectContaining({
                    params: {
                        view: viewParam,
                    },
                    type: JobType.DeleteTicket,
                    scheduled_datetime: expect.any(String),
                }),
            )
        })
    })

    it('should create job for a list of tickets', async () => {
        const waitForCreateJobRequest = mockCreateJob()
        const { result } = renderHook(
            () => useBulkAction('ticket', [1, 2, 3]),
            {
                wrapper: createWrapper(),
            },
        )

        result.current.createJob(JobType.DeleteTicket)

        await waitForCreateJobRequest(async (request) => {
            expect(await request.json()).toEqual({
                params: {
                    ticket_ids: [1, 2, 3],
                },
                type: JobType.DeleteTicket,
            })
        })
    })

    it('should display a notification when creating a job', () => {
        mockCreateJob()
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringMatching(/^(?!\s*$).+/),
                status: statusMock,
            }),
        )
    })

    it('should update the notification when job is successfully created', async () => {
        mockCreateJob()
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitFor(() => {
            expect(updateNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringMatching(/^(?!\s*$).+/),
                    status: NotificationStatus.Success,
                    buttons: expect.any(Array),
                }),
            )
        })
    })

    it('should display a cancel button for job at view level', async () => {
        mockCreateJob()
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitFor(() => {
            expect(updateNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    buttons: [expect.objectContaining({ name: 'Cancel' })],
                }),
            )
        })
        ;(
            updateNotificationMock.mock.calls[0][0] as unknown as {
                buttons: { onClick: () => void }[]
            }
        ).buttons[0].onClick()

        expect(mutateCancelJobMock).toHaveBeenCalledWith({ id: 123 })
    })

    it('should not display a cancel button for job at ticket level', async () => {
        mockCreateJob()
        const { result } = renderHook(() => useBulkAction('ticket'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitFor(() => {
            expect(updateNotification).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    buttons: expect.anything(),
                }),
            )
        })
    })

    it('should cancel job', async () => {
        mockCreateJob()
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitFor(() => {
            expect(updateNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    buttons: [expect.objectContaining({ name: 'Cancel' })],
                }),
            )
        })
        ;(
            updateNotificationMock.mock.calls[0][0] as unknown as {
                buttons: { onClick: () => void }[]
            }
        ).buttons[0].onClick()

        expect(mutateCancelJobMock).toHaveBeenCalledWith({ id: 123 })
    })

    it('should update the notification when job is unsuccessfully created with an unauthorized error', async () => {
        server.use(
            mockCreateJobHandler(async () =>
                HttpResponse.json({ error: { msg: 'Unauthorized' } } as never, {
                    status: 403,
                }),
            ).handler,
        )
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitFor(() => {
            expect(updateNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Unauthorized',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })

    it('should update the notification when job is unsuccessfully created', async () => {
        server.use(
            mockCreateJobHandler(async () =>
                HttpResponse.json({ error: { msg: 'foo' } } as never, {
                    status: 500,
                }),
            ).handler,
        )
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitFor(() => {
            expect(updateNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Failed to apply action on tickets view. Please try again.',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })
})
