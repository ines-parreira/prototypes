import { assumeMock } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useGetSelfServiceConfiguration } from 'models/selfServiceConfiguration/queries'
import { updateSelfServiceConfigurationSSP } from 'models/selfServiceConfiguration/resources'
import type { AlertNotification } from 'state/notifications/types'
import { renderHookWithToaster } from 'tests/renderHookWithToaster'

import useSelfServiceConfiguration from '../useSelfServiceConfiguration'
import { useSelfServiceConfigurationUpdate } from '../useSelfServiceConfigurationUpdate'
import useSelfServiceStoreIntegration from '../useSelfServiceStoreIntegration'

jest.mock('@tanstack/react-query')
jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('models/selfServiceConfiguration/queries')
jest.mock('models/selfServiceConfiguration/resources')
jest.mock('../useSelfServiceStoreIntegration')
jest.mock('../useSelfServiceConfigurationUpdate')

const useSelfServiceConfigurationUpdateMock =
    useSelfServiceConfigurationUpdate as jest.Mock
const useAiAgentAccessMock = useAiAgentAccess as jest.Mock
const useGetSelfServiceConfigurationMock =
    useGetSelfServiceConfiguration as jest.Mock
const useSelfServiceStoreIntegrationMock =
    useSelfServiceStoreIntegration as jest.Mock
const updateSelfServiceConfigurationSSPMock =
    updateSelfServiceConfigurationSSP as jest.Mock
const useQueryClientMock = assumeMock(useQueryClient)

const shopType = 'exampleShopType'
const shopName = 'exampleShopName'

const mockConfigurationData = {
    deletedDatetime: null,
    someConfigField: 'someValue',
}

const mockStoreIntegration = {
    id: 'storeIntegration123',
}

const findToast = () => screen.findByRole('status')

describe('useSelfServiceConfiguration', () => {
    let mockHandleConfigurationUpdate: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: jest.fn(),
                    setQueryData: jest.fn(),
                }) as unknown as QueryClient,
        )
        mockHandleConfigurationUpdate = jest.fn()
        useSelfServiceConfigurationUpdateMock.mockReturnValue({
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: mockHandleConfigurationUpdate,
        })
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        useGetSelfServiceConfigurationMock.mockReturnValue({
            data: mockConfigurationData,
            isLoading: false,
        })
        useSelfServiceStoreIntegrationMock.mockReturnValue(mockStoreIntegration)
        updateSelfServiceConfigurationSSPMock.mockResolvedValue({
            ...mockConfigurationData,
            deletedDatetime: null,
        })
    })

    afterEach(() => {
        act(() => {
            toast.dismiss()
        })
    })

    it('should initialize with loading state', () => {
        useGetSelfServiceConfigurationMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHookWithToaster(() =>
            useSelfServiceConfiguration(shopType, shopName),
        )

        expect(result.current.isFetchPending).toBe(true)
        expect(result.current.selfServiceConfiguration).toBeUndefined()
    })

    it('should set selfServiceConfiguration when data is fetched', () => {
        const { result } = renderHookWithToaster(() =>
            useSelfServiceConfiguration(shopType, shopName),
        )

        expect(result.current.isFetchPending).toBe(false)
        expect(result.current.selfServiceConfiguration).toEqual(
            mockConfigurationData,
        )
    })

    it('should restore selfServiceConfiguration if deletedDatetime exists and hasAccess is true', () => {
        useGetSelfServiceConfigurationMock.mockReturnValue({
            data: {
                ...mockConfigurationData,
                deletedDatetime: '2024-11-07T12:00:00Z',
            },
            isLoading: false,
        })

        act(() => {
            renderHookWithToaster(() =>
                useSelfServiceConfiguration(shopType, shopName),
            )
        })

        expect(updateSelfServiceConfigurationSSPMock).toHaveBeenCalledWith(
            expect.objectContaining({ deletedDatetime: null }),
        )
    })

    it('should not restore selfServiceConfiguration when hasAccess is false', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        useGetSelfServiceConfigurationMock.mockReturnValue({
            data: {
                ...mockConfigurationData,
                deletedDatetime: '2024-11-07T12:00:00Z',
            },
            isLoading: false,
        })

        renderHookWithToaster(() =>
            useSelfServiceConfiguration(shopType, shopName),
        )

        expect(updateSelfServiceConfigurationSSPMock).not.toHaveBeenCalled()
    })

    it('should show an error toast when storeIntegrationId is not available', async () => {
        useSelfServiceStoreIntegrationMock.mockReturnValue(undefined)

        renderHookWithToaster(() =>
            useSelfServiceConfiguration(shopType, shopName),
        )

        const toastEl = await findToast()
        expect(toastEl).toHaveTextContent('Failed to fetch store integration')
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('should route notifications through a custom notificationHandler when provided', async () => {
        useSelfServiceStoreIntegrationMock.mockReturnValue(undefined)
        const notificationHandler = jest.fn()

        renderHookWithToaster(() =>
            useSelfServiceConfiguration(
                shopType,
                shopName,
                notificationHandler,
            ),
        )

        expect(notificationHandler).toHaveBeenCalledWith({
            message: 'Failed to fetch store integration',
            status: 'error',
        })
        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })
    })

    it('exposes isUpdatePending from the inner update hook', () => {
        useSelfServiceConfigurationUpdateMock.mockReturnValue({
            isUpdatePending: true,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        const { result } = renderHookWithToaster(() =>
            useSelfServiceConfiguration(shopType, shopName),
        )

        expect(result.current.isUpdatePending).toBe(true)
    })

    it('delegates to handleConfigurationUpdate when storeIntegrationId is present', async () => {
        const { result } = renderHookWithToaster(() =>
            useSelfServiceConfiguration(shopType, shopName),
        )

        const patch = jest.fn()
        await act(async () => {
            await result.current.handleSelfServiceConfigurationUpdate(patch, {
                success: 'Yay',
            })
        })

        expect(mockHandleConfigurationUpdate).toHaveBeenCalledWith(
            patch,
            { success: 'Yay' },
            mockStoreIntegration.id,
        )
    })

    it('skips handleConfigurationUpdate when storeIntegrationId is missing', async () => {
        useSelfServiceStoreIntegrationMock.mockReturnValue(undefined)

        const { result } = renderHookWithToaster(() =>
            useSelfServiceConfiguration(shopType, shopName),
        )

        await act(async () => {
            await result.current.handleSelfServiceConfigurationUpdate(jest.fn())
        })

        expect(mockHandleConfigurationUpdate).not.toHaveBeenCalled()
    })

    describe('internal handleNotify toast mapping', () => {
        const callHandleNotify = (notification: {
            message?: string
            status: AlertNotification['status']
        }) => {
            renderHookWithToaster(() =>
                useSelfServiceConfiguration(shopType, shopName),
            )
            const [{ handleNotify }] =
                useSelfServiceConfigurationUpdateMock.mock.calls.at(-1) ?? []
            act(() => {
                handleNotify(notification)
            })
        }

        it('routes Success notifications to a success toast', async () => {
            callHandleNotify({
                message: 'success message',
                status: 'success' as AlertNotification['status'],
            })

            const toastEl = await findToast()
            expect(toastEl).toHaveTextContent('success message')
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('routes Error notifications to a destructive toast', async () => {
            callHandleNotify({
                message: 'error message',
                status: 'error' as AlertNotification['status'],
            })

            const toastEl = await findToast()
            expect(toastEl).toHaveTextContent('error message')
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('routes Warning notifications to a warning toast', async () => {
            callHandleNotify({
                message: 'warning message',
                status: 'warning' as AlertNotification['status'],
            })

            const toastEl = await findToast()
            expect(toastEl).toHaveTextContent('warning message')
            expect(toastEl).toHaveAttribute('data-intent', 'warning')
        })

        it('routes Info notifications to an info toast', async () => {
            callHandleNotify({
                message: 'info message',
                status: 'info' as AlertNotification['status'],
            })

            const toastEl = await findToast()
            expect(toastEl).toHaveTextContent('info message')
            expect(toastEl).toHaveAttribute('data-intent', 'info')
        })

        it('falls back to an info toast for other statuses', async () => {
            callHandleNotify({
                message: 'loading message',
                status: 'loading' as AlertNotification['status'],
            })

            const toastEl = await findToast()
            expect(toastEl).toHaveTextContent('loading message')
            expect(toastEl).toHaveAttribute('data-intent', 'info')
        })

        it('uses an empty string when message is missing', async () => {
            callHandleNotify({
                status: 'success' as AlertNotification['status'],
            })

            const toastEl = await findToast()
            expect(toastEl).toHaveAttribute('data-intent', 'success')
            expect(toastEl).toHaveTextContent('')
        })

        it('defers to a custom notificationHandler when provided', async () => {
            const notificationHandler = jest.fn()
            renderHookWithToaster(() =>
                useSelfServiceConfiguration(
                    shopType,
                    shopName,
                    notificationHandler,
                ),
            )
            const [{ handleNotify }] =
                useSelfServiceConfigurationUpdateMock.mock.calls.at(-1) ?? []
            const notif = {
                message: 'custom',
                status: 'success' as AlertNotification['status'],
            }

            act(() => {
                handleNotify(notif)
            })

            expect(notificationHandler).toHaveBeenCalledWith(notif)
            await waitFor(() => {
                expect(screen.queryByRole('status')).not.toBeInTheDocument()
            })
        })
    })
})
