import {JobType, ViewType, useCreateJob} from '@gorgias/api-queries'
import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import {notify as updateNotification} from 'reapop'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {view} from 'fixtures/views'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import useBulkAction from '../useBulkAction'
import useCancelJob from '../useCancelJob'
import useNotificationPayload from '../useNotificationPayload'

jest.mock('reapop')
const updateNotificationMock = assumeMock(updateNotification)
jest.mock('@gorgias/api-queries')
const useCreateJobMock = assumeMock(useCreateJob)
jest.mock('../useCancelJob')
const useCancelJobMock = assumeMock(useCancelJob)
jest.mock('../useNotificationPayload')
const useNotificationPayloadMock = assumeMock(useNotificationPayload)
jest.mock('state/notifications/actions')
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mutateCreateJobMock = jest.fn()
const createJobResponse = () =>
    ({
        isLoading: false,
        mutateAsync: mutateCreateJobMock,
    }) as unknown as ReturnType<typeof useCreateJob>

const mutateCancelJobMock = jest.fn()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const {with_highlights, ...viewFixture} = view
const defaultState = {
    views: fromJS({
        active: {
            ...viewFixture,
            type: ViewType.TicketList,
        },
    }),
} as unknown as RootState
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useBulkAction', () => {
    const statusMock = 'jobStatus'
    const getNotificationParamsMock = jest.fn()
    const getNotificationPayloadMock = jest.fn().mockReturnValue({
        status: statusMock,
        message: 'Job is launched',
    })

    useCreateJobMock.mockReturnValue(createJobResponse())
    useCancelJobMock.mockReturnValue({
        cancelJob: mutateCancelJobMock,
    } as unknown as ReturnType<typeof useCancelJob>)
    useNotificationPayloadMock.mockReturnValue({
        getNotificationParams: getNotificationParamsMock,
        getNotificationPayload: getNotificationPayloadMock,
    } as unknown as ReturnType<typeof useNotificationPayload>)

    it('should generate a notification for a singular ticket', () => {
        renderHook(() => useBulkAction('ticket', [1]), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(useNotificationPayloadMock).toHaveBeenCalledWith(
            expect.objectContaining({
                objectType: 'ticket',
            })
        )
    })

    it('should generate a notification for multiple tickets', () => {
        renderHook(() => useBulkAction('ticket', [1, 2]), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(useNotificationPayloadMock).toHaveBeenCalledWith(
            expect.objectContaining({
                objectType: 'tickets',
            })
        )
    })

    it('should create job for a non-dirty view', () => {
        const {result} = renderHook(() => useBulkAction('view'), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })
        void result.current.createJob(JobType.DeleteTicket)

        expect(mutateCreateJobMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    params: {
                        view_id: view.id,
                    },
                    type: JobType.DeleteTicket,
                    scheduled_datetime: expect.any(String),
                },
            })
        )
    })

    it('should create job for a dirty view', () => {
        const {result} = renderHook(() => useBulkAction('view'), {
            wrapper: ({children}) => (
                <Provider
                    store={mockStore({
                        views: fromJS({
                            active: {
                                ...viewFixture,
                                dirty: true,
                                type: ViewType.TicketList,
                            },
                        }),
                    })}
                >
                    {children}
                </Provider>
            ),
        })
        void result.current.createJob(JobType.DeleteTicket)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {id, slug, uri, ...viewParam} = viewFixture

        expect(mutateCreateJobMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    params: {
                        view: viewParam,
                    },
                    type: JobType.DeleteTicket,
                    scheduled_datetime: expect.any(String),
                },
            })
        )
    })

    it('should create job for a list of tickets', () => {
        const {result} = renderHook(() => useBulkAction('ticket', [1, 2, 3]), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })
        void result.current.createJob(JobType.DeleteTicket)

        expect(mutateCreateJobMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    params: {
                        ticket_ids: [1, 2, 3],
                    },
                    type: JobType.DeleteTicket,
                },
            })
        )
    })

    it('should display a notification when creating a job', () => {
        const {result} = renderHook(() => useBulkAction('view'), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })
        void result.current.createJob(JobType.DeleteTicket)

        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringMatching(/^(?!\s*$).+/),
                status: statusMock,
            })
        )
    })

    it('should update the notification when job is successfully created', () => {
        const {result} = renderHook(() => useBulkAction('view'), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })
        void result.current.createJob(JobType.DeleteTicket)

        useCreateJobMock.mock.calls[0][0]?.mutation?.onSuccess?.(
            axiosSuccessResponse({id: 123}),
            {
                data: {
                    params: {},
                    type: JobType.DeleteTicket,
                },
            },
            undefined
        )

        expect(updateNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringMatching(/^(?!\s*$).+/),
                status: NotificationStatus.Success,
                buttons: expect.any(Array),
            })
        )
    })

    it('should display a cancel button for job at view level', () => {
        const {result} = renderHook(() => useBulkAction('view'), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })
        void result.current.createJob(JobType.DeleteTicket)

        useCreateJobMock.mock.calls[0][0]?.mutation?.onSuccess?.(
            axiosSuccessResponse({id: 123}),
            {
                data: {
                    params: {},
                    type: JobType.DeleteTicket,
                },
            },
            undefined
        )

        expect(updateNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                buttons: [expect.objectContaining({name: 'Cancel'})],
            })
        )
        ;(
            updateNotificationMock.mock.calls[0][0] as unknown as {
                buttons: {onClick: () => void}[]
            }
        ).buttons[0].onClick()

        expect(mutateCancelJobMock).toHaveBeenCalledWith({id: 123})
    })

    it('should not display a cancel button for job at ticket level', () => {
        const {result} = renderHook(() => useBulkAction('ticket'), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })
        void result.current.createJob(JobType.DeleteTicket)

        useCreateJobMock.mock.calls[0][0]?.mutation?.onSuccess?.(
            axiosSuccessResponse({id: 123}),
            {
                data: {
                    params: {},
                    type: JobType.DeleteTicket,
                },
            },
            undefined
        )

        expect(updateNotification).toHaveBeenCalledWith(
            expect.not.objectContaining({
                buttons: expect.anything(),
            })
        )
    })

    it('should cancel job', () => {
        renderHook(() => useBulkAction('view'), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        useCreateJobMock.mock.calls[0][0]?.mutation?.onSuccess?.(
            axiosSuccessResponse({id: 123}),
            {
                data: {
                    params: {},
                    type: JobType.DeleteTicket,
                },
            },
            undefined
        )
        ;(
            updateNotificationMock.mock.calls[0][0] as unknown as {
                buttons: {onClick: () => void}[]
            }
        ).buttons[0].onClick()

        expect(mutateCancelJobMock).toHaveBeenCalledWith({id: 123})
    })

    it('should update the notification when job is unsuccessfully created with an unauthorized error', () => {
        const {result} = renderHook(() => useBulkAction('view'), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })
        void result.current.createJob(JobType.DeleteTicket)
        useCreateJobMock.mock.calls[0][0]?.mutation?.onError?.(
            {
                response: {
                    status: 403,
                    data: {error: {msg: 'Unauthorized'}},
                },
            },
            {
                data: {
                    params: {},
                    type: JobType.DeleteTicket,
                },
            },
            undefined
        )

        expect(updateNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Unauthorized',
                status: NotificationStatus.Error,
            })
        )
    })

    it('should update the notification when job is unsuccessfully created', () => {
        const {result} = renderHook(() => useBulkAction('view'), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })
        void result.current.createJob(JobType.DeleteTicket)
        useCreateJobMock.mock.calls[0][0]?.mutation?.onError?.(
            {
                error: new Error('foo'),
                message: 'foo',
            },
            {
                data: {
                    params: {},
                    type: JobType.DeleteTicket,
                },
            },
            undefined
        )

        expect(updateNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                message:
                    'Failed to apply action on tickets view. Please try again.',
                status: NotificationStatus.Error,
            })
        )
    })
})
