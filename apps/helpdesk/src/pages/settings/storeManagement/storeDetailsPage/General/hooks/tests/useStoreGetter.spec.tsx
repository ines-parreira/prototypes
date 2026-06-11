import React from 'react'

import { render, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import type { AxiosError } from 'axios'
import { useHistory } from 'react-router-dom'

import { toast, Toaster } from '@gorgias/axiom'
import { useGetIntegration } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/constants'

import { useStoreGetter } from '../useStoreGetter'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetIntegration: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    useAppDispatch: () => jest.fn(),
}))

describe('useStoreGetter', () => {
    const mockPush = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useHistory as jest.Mock).mockReturnValue({ push: mockPush })
    })

    afterEach(() => {
        toast.dismiss()
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

    it('should redirect and show error for invalid integration type', async () => {
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

        render(<Toaster />)
        renderHook(() => useStoreGetter(1))

        expect(mockPush).toHaveBeenCalledWith('/app/settings/store-management')
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Integration type mismatch',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should handle API errors correctly', async () => {
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

        render(<Toaster />)
        renderHook(() => useStoreGetter(1))

        expect(mockPush).toHaveBeenCalledWith('/app/settings/store-management')
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to get integration',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should handle API errors with no error message', async () => {
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

        render(<Toaster />)
        renderHook(() => useStoreGetter(1))

        expect(mockPush).toHaveBeenCalledWith('/app/settings/store-management')
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to get integration',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
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
