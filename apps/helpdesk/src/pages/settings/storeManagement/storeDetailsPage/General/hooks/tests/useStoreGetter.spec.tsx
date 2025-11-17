import { renderHook } from '@repo/testing'
import type { AxiosError } from 'axios'
import { useHistory } from 'react-router-dom'

import { useGetIntegration } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import useStoreGetter from '../useStoreGetter'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetIntegration: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

describe('useStoreGetter', () => {
    const mockPush = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useHistory as jest.Mock).mockReturnValue({ push: mockPush })
        ;(notify as jest.Mock).mockReturnValue({ type: 'NOTIFY' })
    })

    it('should return data and loading state for valid integration', () => {
        const mockData = {
            data: {
                id: 1,
                type: IntegrationType.Shopify,
            },
        }

        ;(useGetIntegration as jest.Mock).mockReturnValue({
            isFetching: false,
            data: mockData,
            error: null,
        })

        const { result } = renderHook(() => useStoreGetter(1))

        expect(result.current.data).toEqual(mockData)
        expect(result.current.isFetching).toBe(false)
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('should redirect and show error for invalid integration type', () => {
        const mockData = {
            data: {
                id: 1,
                type: 'INVALID_TYPE',
            },
        }

        ;(useGetIntegration as jest.Mock).mockReturnValue({
            isFetching: false,
            data: mockData,
            error: null,
        })

        renderHook(() => useStoreGetter(1))

        expect(mockPush).toHaveBeenCalledWith('/app/settings/store-management')
        expect(notify).toHaveBeenCalledWith({
            title: 'Integration type mismatch',
            message: 'The Integration id 1 is not a valid store integration.',
            allowHTML: true,
            status: NotificationStatus.Error,
        })
    })

    it('should handle API errors correctly', () => {
        const mockError = {
            name: 'AxiosError',
            message: 'API Error Message',
            isAxiosError: true,
            response: {
                data: {
                    error: {
                        msg: 'API Error Message',
                    },
                },
            },
        } as AxiosError

        ;(useGetIntegration as jest.Mock).mockReturnValue({
            isFetching: false,
            data: null,
            error: mockError,
        })

        renderHook(() => useStoreGetter(1))

        expect(mockPush).toHaveBeenCalledWith('/app/settings/store-management')
        expect(notify).toHaveBeenCalledWith({
            title: 'Failed to get integration',
            message: 'API Error Message',
            allowHTML: true,
            status: NotificationStatus.Error,
        })
    })

    it('should handle API errors with no error message', () => {
        const mockError = {
            response: {
                data: {},
            },
        }

        ;(useGetIntegration as jest.Mock).mockReturnValue({
            isFetching: false,
            data: null,
            error: mockError,
        })

        renderHook(() => useStoreGetter(1))

        expect(mockPush).toHaveBeenCalledWith('/app/settings/store-management')
        expect(notify).toHaveBeenCalledWith({
            title: 'Failed to get integration',
            message: 'Failed to get integration',
            allowHTML: true,
            status: NotificationStatus.Error,
        })
    })

    it('should accept valid store integration types', () => {
        const validTypes = [
            IntegrationType.Shopify,
            IntegrationType.Magento2,
            IntegrationType.BigCommerce,
        ]

        validTypes.forEach((type) => {
            const mockData = {
                data: {
                    id: 1,
                    type,
                },
            }

            ;(useGetIntegration as jest.Mock).mockReturnValue({
                isFetching: false,
                data: mockData,
                error: null,
            })

            const { result } = renderHook(() => useStoreGetter(1))

            expect(result.current.data).toEqual(mockData)
            expect(mockPush).not.toHaveBeenCalled()
        })
    })
})
