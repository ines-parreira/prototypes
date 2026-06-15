import React from 'react'

import { assumeMock, renderHook, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toast } from '@gorgias/axiom'
import {
    mockCreateJobHandler,
    mockCreateJobResponse,
} from '@gorgias/helpdesk-mocks'
import { JobType, ViewType } from '@gorgias/helpdesk-types'

import { view } from 'fixtures/views'
import type { RootState, StoreDispatch } from 'state/types'

import { useBulkAction } from '../useBulkAction'
import { useCancelJob } from '../useCancelJob'
import { useNotificationPayload } from '../useNotificationPayload'

Element.prototype.setPointerCapture = jest.fn()
Element.prototype.releasePointerCapture = jest.fn()

jest.mock('../useCancelJob')
const useCancelJobMock = assumeMock(useCancelJob)

jest.mock('../useNotificationPayload')
const useNotificationPayloadMock = assumeMock(useNotificationPayload)

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
    toast.dismiss()
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
    const getNotificationParamsMock = jest.fn()
    const getNotificationPayloadMock = jest.fn().mockReturnValue({
        id: 'test-notification-id',
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

    it('should display a toast notification when creating a job', async () => {
        mockCreateJob()
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitFor(() => {
            const toastEl = screen.getByRole('status')
            expect(toastEl).toHaveTextContent('Job is launched')
        })
    })

    it('should display a success toast when job is successfully created', async () => {
        mockCreateJob()
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitFor(() => {
            const toastEl = screen.getByRole('status')
            expect(toastEl).toHaveTextContent('Job is launched')
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should display a cancel button for job at view level', async () => {
        mockCreateJob()
        const { result } = renderHook(() => useBulkAction('view'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        const button = await screen.findByRole('button', { name: 'Cancel' })
        const user = userEvent.setup()
        await user.click(button)

        expect(mutateCancelJobMock).toHaveBeenCalledWith({ id: 123 })
    })

    it('should not display a cancel button for job at ticket level', async () => {
        mockCreateJob()
        const { result } = renderHook(() => useBulkAction('ticket'), {
            wrapper: createWrapper(),
        })

        result.current.createJob(JobType.DeleteTicket)

        await waitFor(() => {
            const toastEl = screen.getByRole('status')
            expect(toastEl).toHaveTextContent('Job is launched')
        })

        expect(
            screen.queryByRole('button', { name: 'Cancel' }),
        ).not.toBeInTheDocument()
    })

    it('should display an error toast with unauthorized message on 403', async () => {
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
            const toastEl = screen.getByRole('status')
            expect(toastEl).toHaveTextContent('Unauthorized')
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should display a generic error toast when job creation fails', async () => {
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
            const toastEl = screen.getByRole('status')
            expect(toastEl).toHaveTextContent(
                'Failed to apply action on tickets view. Please try again.',
            )
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
