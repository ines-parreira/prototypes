import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {JobType, ViewType, useCreateJob} from '@gorgias/api-queries'
import {notify as updateNotification} from 'reapop'

import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {view} from 'fixtures/views'
import {assumeMock} from 'utils/testing'
import {notify} from 'state/notifications/actions'
import {RootState, StoreDispatch} from 'state/types'
import {NotificationStatus} from 'state/notifications/types'

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
    } as unknown as ReturnType<typeof useCreateJob>)

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
    const notificationPayloadMock = {
        message: 'Job is launched',
        status: 'jobStatus',
    }

    useCreateJobMock.mockReturnValue(createJobResponse())
    useCancelJobMock.mockReturnValue({
        cancelJob: mutateCancelJobMock,
        notificationPayload: notificationPayloadMock,
    } as unknown as ReturnType<typeof useCancelJob>)
    useNotificationPayloadMock.mockReturnValue(
        notificationPayloadMock as unknown as ReturnType<
            typeof useNotificationPayload
        >
    )

    it('should create job for a non-dirty view', () => {
        const {result} = renderHook(
            () =>
                useBulkAction({
                    jobType: JobType.DeleteTicket,
                    level: 'view',
                }),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )
        void result.current.createJob()

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
        const {result} = renderHook(
            () =>
                useBulkAction({
                    jobType: JobType.DeleteTicket,
                    level: 'view',
                }),
            {
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
            }
        )
        void result.current.createJob()

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
        const {result} = renderHook(
            () =>
                useBulkAction({
                    jobType: JobType.DeleteTicket,
                    level: 'ticket',
                    ticketIds: [1, 2, 3],
                }),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )
        void result.current.createJob()

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
        const {result} = renderHook(
            () =>
                useBulkAction({
                    jobType: JobType.DeleteTicket,
                    level: 'view',
                }),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )
        void result.current.createJob()

        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining(notificationPayloadMock)
        )
    })

    it('should update the notification when job is successfully created', () => {
        const {result} = renderHook(
            () =>
                useBulkAction({
                    jobType: JobType.DeleteTicket,
                    level: 'view',
                }),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )
        void result.current.createJob()

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
                ...notificationPayloadMock,
                status: NotificationStatus.Success,
            })
        )
    })

    it('should display a cancel button for job at view level', () => {
        const {result} = renderHook(
            () =>
                useBulkAction({
                    jobType: JobType.DeleteTicket,
                    level: 'view',
                }),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )
        void result.current.createJob()

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

    it('should not display buttons for job at ticket level', () => {
        const {result} = renderHook(
            () =>
                useBulkAction({
                    jobType: JobType.DeleteTicket,
                    level: 'ticket',
                }),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )
        void result.current.createJob()

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

    it('should update the notification when job is unsuccessfully created with an unauthorized error', () => {
        const {result} = renderHook(
            () =>
                useBulkAction({
                    jobType: JobType.DeleteTicket,
                    level: 'view',
                }),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )
        void result.current.createJob()
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
        const {result} = renderHook(
            () =>
                useBulkAction({
                    jobType: JobType.DeleteTicket,
                    level: 'view',
                }),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )
        void result.current.createJob()
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
