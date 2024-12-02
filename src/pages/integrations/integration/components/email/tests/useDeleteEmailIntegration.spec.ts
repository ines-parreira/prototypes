import {useDeleteIntegration} from '@gorgias/api-queries'
import {renderHook, act} from '@testing-library/react-hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import {isGorgiasApiError} from 'models/api/types'
import history from 'pages/history'
import {DELETE_INTEGRATION_SUCCESS} from 'state/integrations/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {assumeMock} from 'utils/testing'

import useDeleteEmailIntegration from '../useDeleteEmailIntegration'

jest.mock('@gorgias/api-queries')
jest.mock('hooks/useAppDispatch')
jest.mock('pages/history')
jest.mock('state/notifications/actions')
jest.mock('models/api/types')

const useDeleteIntegrationMock = assumeMock(useDeleteIntegration)
const useAppDispatchMock = assumeMock(useAppDispatch)
const isGorgiasApiErrorMock = assumeMock(isGorgiasApiError)

describe('useDeleteEmailIntegration', () => {
    const mockDispatch = jest.fn()
    const mockPush = jest.fn()

    beforeEach(() => {
        history.push = mockPush
        isGorgiasApiErrorMock.mockReturnValue(false)
        useAppDispatchMock.mockReturnValue(mockDispatch)
    })

    it('should handle successful deletion', () => {
        const integration = {id: 'test-id'}
        const mutate = jest.fn()
        useDeleteIntegrationMock.mockReturnValue({
            mutate,
            isLoading: false,
        } as any)

        const {result} = renderHook(() =>
            useDeleteEmailIntegration(integration as any)
        )

        act(() => {
            result.current.deleteIntegration()
        })

        expect(mutate).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-id',
            })
        )

        act(() => {
            useDeleteIntegrationMock.mock.lastCall?.[0]?.mutation?.onSuccess?.(
                null as any,
                null as any,
                null as any
            )
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: DELETE_INTEGRATION_SUCCESS,
            id: integration.id,
        })
        expect(mockPush).toHaveBeenCalledWith(expect.any(String))
    })

    it('should handle deletion error', () => {
        const integration = {id: 'test-id'}
        const mutate = jest.fn()
        const errorResponse = {
            response: {data: {error: {msg: 'Error message'}}},
        }
        useDeleteIntegrationMock.mockReturnValue({
            mutate,
            isLoading: false,
        } as any)
        isGorgiasApiErrorMock.mockReturnValue(true)

        const {result} = renderHook(() =>
            useDeleteEmailIntegration(integration as any)
        )

        act(() => {
            result.current.deleteIntegration()
        })

        act(() => {
            useDeleteIntegrationMock.mock.lastCall?.[0]?.mutation?.onError?.(
                errorResponse,
                null as any,
                null as any
            )
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Error,
                message: 'Error message',
            })
        )
    })

    it('should handle deletion error with default message', () => {
        const integration = {id: 'test-id'}
        const mutate = jest.fn()
        useDeleteIntegrationMock.mockReturnValue({
            mutate,
            isLoading: false,
        } as any)
        isGorgiasApiErrorMock.mockReturnValue(false)

        const {result} = renderHook(() =>
            useDeleteEmailIntegration(integration as any)
        )

        act(() => {
            result.current.deleteIntegration()
        })

        act(() => {
            useDeleteIntegrationMock.mock.lastCall?.[0]?.mutation?.onError?.(
                null as any,
                null as any,
                null as any
            )
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Error,
                message: 'Failed to delete integration',
            })
        )
    })
})
