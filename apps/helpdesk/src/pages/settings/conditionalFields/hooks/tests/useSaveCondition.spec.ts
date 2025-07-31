import { renderHook } from '@repo/testing'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import { useCreateCustomFieldCondition } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'
import { assumeMock } from 'utils/testing'

import useSaveCondition from '../useSaveCondition'
import useUpdateCustomFieldCondition from '../useUpdateCustomFieldCondition'

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
}))

jest.mock('hooks/useAppDispatch')
jest.mock('@gorgias/helpdesk-queries', () => ({
    useCreateCustomFieldCondition: jest.fn(),
    queryKeys: {
        customFieldConditions: {
            listCustomFieldConditions: jest.fn(),
            getCustomFieldCondition: jest.fn(),
        },
    },
}))
jest.mock('../useUpdateCustomFieldCondition')
jest.mock('state/notifications/actions')
jest.mock('pages/settings/SLAs/utils/handleApiError')
jest.mock('pages/history')
jest.mock('utils')

const useAppDispatchMock = assumeMock(useAppDispatch)
const useQueryClientMock = assumeMock(useQueryClient)
const useCreateCustomFieldConditionMock = assumeMock(
    useCreateCustomFieldCondition,
)
const useUpdateCustomFieldConditionMock = assumeMock(
    useUpdateCustomFieldCondition,
)
const errorToChildrenMock = assumeMock(errorToChildren)

describe('useSaveCondition', () => {
    const dispatch = jest.fn()
    const queryClient = {
        invalidateQueries: jest.fn(),
    }
    const createCondition = jest.fn()
    const updateCondition = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatch)
        useQueryClientMock.mockReturnValue(
            queryClient as unknown as QueryClient,
        )
        useCreateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: createCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useCreateCustomFieldCondition>)
        useUpdateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: updateCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpdateCustomFieldCondition>)
    })

    it('should create a condition successfully', async () => {
        const { result } = renderHook(() => useSaveCondition())

        await act(async () => {
            await result.current.onSubmit({ name: 'New Condition' })
        })

        expect(createCondition).toHaveBeenCalledWith({
            data: { name: 'New Condition' },
        })
        expect(dispatch).toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Success,
                message: 'Condition created successfully',
            }),
        )
        expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1)
        expect(history.push).toHaveBeenCalledWith(
            `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
        )
    })

    it('should update a condition successfully', async () => {
        const { result } = renderHook(() => useSaveCondition(1))

        await act(async () => {
            await result.current.onSubmit({ name: 'Updated Condition' })
        })

        expect(updateCondition).toHaveBeenCalledWith({
            id: 1,
            data: { name: 'Updated Condition' },
        })
        expect(dispatch).toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Success,
                message: 'Condition updated successfully',
            }),
        )
        expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2)
        expect(history.push).toHaveBeenCalledWith(
            `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
        )
    })

    it('should handle errors when creating a condition', async () => {
        const error = new Error('Create error')
        createCondition.mockRejectedValueOnce(error)

        const { result } = renderHook(() => useSaveCondition())

        await act(async () => {
            await result.current.onSubmit({ name: 'New Condition' })
        })

        expect(dispatch).toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Error,
                message: 'Create error message',
                allowHTML: true,
            }),
        )

        expect(errorToChildrenMock).toHaveBeenCalledWith(error)
    })

    it('should handle errors when updating a condition', async () => {
        const error = new Error('Update error')
        updateCondition.mockRejectedValueOnce(error)

        const { result } = renderHook(() => useSaveCondition(1))

        await act(async () => {
            await result.current.onSubmit({ name: 'Updated Condition' })
        })

        expect(dispatch).toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Error,
                message: 'Update error message',
                allowHTML: true,
            }),
        )
    })

    it('should return isSubmitting as true when creating or updating', () => {
        useCreateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: createCondition,
            isLoading: true,
        } as unknown as ReturnType<typeof useCreateCustomFieldCondition>)
        useUpdateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: updateCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpdateCustomFieldCondition>)

        const { result } = renderHook(() => useSaveCondition())

        expect(result.current.isSubmitting).toBe(true)

        useCreateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: createCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useCreateCustomFieldCondition>)
        useUpdateCustomFieldConditionMock.mockReturnValue({
            mutateAsync: updateCondition,
            isLoading: true,
        } as unknown as ReturnType<typeof useUpdateCustomFieldCondition>)

        const { result: result2 } = renderHook(() => useSaveCondition())

        expect(result2.current.isSubmitting).toBe(true)
    })

    it('should return isSubmitting as false when neither creating nor updating', () => {
        const { result } = renderHook(() => useSaveCondition())

        expect(result.current.isSubmitting).toBe(false)
    })
})
