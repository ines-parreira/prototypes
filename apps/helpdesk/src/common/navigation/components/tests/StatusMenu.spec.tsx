import React from 'react'

import {
    useSelectableAgentAvailabilityStatuses,
    useUpdateUserAvailabilityStatus,
    useUserAvailability,
} from '@repo/agent-status'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { act, render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { NotificationStatus } from 'state/notifications/types'

import StatusMenu from '../StatusMenu'

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useUserAvailability: jest.fn(),
    useSelectableAgentAvailabilityStatuses: jest.fn(),
    useUpdateUserAvailabilityStatus: jest.fn(),
}))

const useUserAvailabilityMock = assumeMock(useUserAvailability)
const useSelectableAgentAvailabilityStatusesMock = assumeMock(
    useSelectableAgentAvailabilityStatuses,
)
const useUpdateUserAvailabilityStatusMock = assumeMock(
    useUpdateUserAvailabilityStatus,
)
const useAppDispatchMock = assumeMock(useAppDispatch)
const isGorgiasApiErrorMock = assumeMock(isGorgiasApiError)

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => 123),
}))

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(() => jest.fn()),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn((params) => params),
}))

jest.mock('models/api/types', () => ({
    ...jest.requireActual('models/api/types'),
    isGorgiasApiError: jest.fn(),
}))

const mockStatuses = [
    {
        id: 'available',
        name: 'Available',
        description: 'Available to receive tickets',
        duration_unit: null,
        duration_value: null,
        durationDisplay: 'Until changed',
        is_system: true,
        created_datetime: '1970-01-01T00:00:00.000Z',
        updated_datetime: '1970-01-01T00:00:00.000Z',
    },
    {
        id: 'unavailable',
        name: 'Unavailable',
        description: 'Default unavailable status set manually by each agent',
        duration_unit: null,
        duration_value: null,
        durationDisplay: 'Until changed',
        is_system: true,
        created_datetime: '1970-01-01T00:00:00.000Z',
        updated_datetime: '1970-01-01T00:00:00.000Z',
    },
    {
        id: 'custom-1',
        name: 'Lunch break',
        description: 'On lunch break',
        duration_unit: 'minutes' as const,
        duration_value: 30,
        durationDisplay: '30 minutes',
        is_system: false,
        created_datetime: '2024-01-01T00:00:00.000Z',
        updated_datetime: '2024-01-01T00:00:00.000Z',
    },
]

describe('StatusMenu', () => {
    let updateStatusAsync: jest.Mock
    let dispatch: jest.Mock
    let onUpdateStatusStart: jest.Mock

    beforeEach(() => {
        updateStatusAsync = jest.fn().mockResolvedValue(undefined)
        dispatch = jest.fn()
        onUpdateStatusStart = jest.fn()

        useAppDispatchMock.mockReturnValue(dispatch)
        isGorgiasApiErrorMock.mockReturnValue(false)

        useUpdateUserAvailabilityStatusMock.mockReturnValue({
            updateStatusAsync,
        } as any)

        useSelectableAgentAvailabilityStatusesMock.mockReturnValue({
            allStatuses: mockStatuses,
            isLoading: false,
        } as any)

        useUserAvailabilityMock.mockReturnValue({
            status: {
                user_status: 'available' as const,
            },
            activeStatusId: 'available',
            isLoading: false,
        } as any)
    })

    it.each(mockStatuses)('should render the $name status', ({ name }) => {
        const { getByText } = render(
            <StatusMenu onUpdateStatusStart={onUpdateStatusStart} />,
        )
        expect(getByText(name)).toBeInTheDocument()
    })

    it.each([
        {
            name: 'available',
            displayName: 'Available',
            userStatus: 'available' as const,
            activeStatusId: 'available',
            customId: undefined,
        },
        {
            name: 'unavailable',
            displayName: 'Unavailable',
            userStatus: 'unavailable' as const,
            activeStatusId: 'unavailable',
            customId: undefined,
        },
        {
            name: 'custom',
            displayName: 'Lunch break',
            userStatus: 'custom' as const,
            activeStatusId: 'custom-1',
            customId: 'custom-1',
        },
    ])(
        'should mark the current $name status with checkmark',
        ({ displayName, userStatus, activeStatusId, customId }) => {
            useUserAvailabilityMock.mockReturnValue({
                status: {
                    user_status: userStatus,
                    ...(customId && {
                        custom_user_availability_status_id: customId,
                    }),
                },
                activeStatusId,
                isLoading: false,
            } as any)

            const { getByText } = render(
                <StatusMenu onUpdateStatusStart={onUpdateStatusStart} />,
            )
            const button = getByText(displayName).closest('button')!

            expect(within(button).getByText('done')).toBeInTheDocument()
        },
    )

    it.each([
        {
            name: 'available',
            displayName: 'Available',
            statusId: 'available',
            expectedArgs: [123, 'available'],
        },
        {
            name: 'unavailable',
            displayName: 'Unavailable',
            statusId: 'unavailable',
            expectedArgs: [123, 'unavailable'],
        },
        {
            name: 'custom',
            displayName: 'Lunch break',
            statusId: 'custom-1',
            expectedArgs: [123, 'custom-1'],
        },
    ])(
        'should update to $name status and log event',
        async ({ displayName, statusId, expectedArgs }) => {
            const { getByText } = render(
                <StatusMenu onUpdateStatusStart={onUpdateStatusStart} />,
            )

            await act(() => userEvent.click(getByText(displayName)))

            expect(updateStatusAsync).toHaveBeenCalledWith(...expectedArgs)
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.MenuUserLinkClicked,
                {
                    link: 'status-update',
                    status_id: statusId,
                },
            )
        },
    )

    it.each([
        {
            scenario: 'statuses are loading',
            setupMocks: () => {
                useSelectableAgentAvailabilityStatusesMock.mockReturnValue({
                    allStatuses: [],
                    isLoading: true,
                    isError: false,
                })
            },
        },
        {
            scenario: 'availability is loading',
            setupMocks: () => {
                useUserAvailabilityMock.mockReturnValue({
                    availability: undefined,
                    activeStatusId: undefined,
                    isLoading: true,
                    isError: false,
                    error: null,
                })
            },
        },
    ])('should show loading state when $scenario', ({ setupMocks }) => {
        setupMocks()

        const { getByText } = render(
            <StatusMenu onUpdateStatusStart={onUpdateStatusStart} />,
        )
        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should not show checkmark when no status is selected', () => {
        useUserAvailabilityMock.mockReturnValue({
            status: undefined,
            activeStatusId: undefined,
            isLoading: false,
        } as any)

        const { queryByText } = render(
            <StatusMenu onUpdateStatusStart={onUpdateStatusStart} />,
        )
        expect(queryByText('done')).not.toBeInTheDocument()
    })

    it('should call onUpdateStatusStart callback when a status is clicked', async () => {
        const { getByText } = render(
            <StatusMenu onUpdateStatusStart={onUpdateStatusStart} />,
        )

        await act(() => userEvent.click(getByText('Available')))

        expect(onUpdateStatusStart).toHaveBeenCalledTimes(1)
    })

    it('should call onUpdateStatusStart before status update', async () => {
        const callOrder: string[] = []

        onUpdateStatusStart.mockImplementation(() => {
            callOrder.push('callback')
        })

        updateStatusAsync.mockImplementation(() => {
            callOrder.push('update')
            return Promise.resolve()
        })

        const { getByText } = render(
            <StatusMenu onUpdateStatusStart={onUpdateStatusStart} />,
        )

        await act(() => userEvent.click(getByText('Unavailable')))

        expect(callOrder).toEqual(['callback', 'update'])
    })

    describe('error handling', () => {
        it.each([
            {
                scenario: 'API error',
                displayName: 'Available',
                error: {
                    response: {
                        data: {
                            error: {
                                msg: 'API error message',
                            },
                        },
                    },
                },
                isApiError: true,
                expectedTitle: 'API error message',
            },
            {
                scenario: 'generic error',
                displayName: 'Unavailable',
                error: new Error('Network error'),
                isApiError: false,
                expectedTitle: 'Failed to update status. Please try again.',
            },
            {
                scenario: 'custom status API error',
                displayName: 'Lunch break',
                error: {
                    response: {
                        data: {
                            error: {
                                msg: 'Custom status error',
                            },
                        },
                    },
                },
                isApiError: true,
                expectedTitle: 'Custom status error',
            },
        ])(
            'should show error notification when update fails with $scenario',
            async ({ displayName, error, isApiError, expectedTitle }) => {
                updateStatusAsync.mockRejectedValueOnce(error)
                isGorgiasApiErrorMock.mockReturnValueOnce(isApiError)

                const { getByText } = render(
                    <StatusMenu onUpdateStatusStart={onUpdateStatusStart} />,
                )

                await act(() => userEvent.click(getByText(displayName)))

                expect(dispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: expectedTitle,
                        status: NotificationStatus.Error,
                    }),
                )
                expect(logEvent).not.toHaveBeenCalled()
            },
        )
    })
})
