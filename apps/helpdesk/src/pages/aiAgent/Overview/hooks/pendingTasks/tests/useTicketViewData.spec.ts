import { useGetAccountConfiguration } from 'models/aiAgent/queries'
import { useGetViewTicketUpdates } from 'models/view/queries'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTicketViewData } from '../useTicketViewData'

jest.mock('models/aiAgent/queries', () => ({
    useGetAccountConfiguration: jest.fn(),
}))
const useGetAccountConfigurationMock = assumeMock(useGetAccountConfiguration)

jest.mock('models/view/queries', () => ({
    useGetViewTicketUpdates: jest.fn(),
}))
const useGetViewTicketUpdatesMock = assumeMock(useGetViewTicketUpdates)

describe('useTicketViewData', () => {
    it('should return isLoading as true when account configuration is loading', () => {
        useGetAccountConfigurationMock.mockReturnValue({
            status: 'loading',
            data: undefined,
        } as any)
        useGetViewTicketUpdatesMock.mockReturnValue({
            status: 'idle',
            data: undefined,
        } as any)

        const { result } = renderHook(() =>
            useTicketViewData({ accountDomain: 'example' }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should return isLoading as true when view ticket update is loading', () => {
        useGetAccountConfigurationMock.mockReturnValue({
            status: 'success',
            data: {
                data: {
                    accountConfiguration: {
                        views: { Close: { id: 123 } },
                    },
                },
            },
        } as any)
        useGetViewTicketUpdatesMock.mockReturnValue({
            status: 'loading',
            data: undefined,
        } as any)

        const { result } = renderHook(() =>
            useTicketViewData({ accountDomain: 'example' }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should return viewId and ticketId when data is successfully loaded', () => {
        useGetAccountConfigurationMock.mockReturnValue({
            status: 'success',
            data: {
                data: {
                    accountConfiguration: {
                        views: { Close: { id: 123 } },
                    },
                },
            },
        } as any)
        useGetViewTicketUpdatesMock.mockReturnValue({
            status: 'success',
            data: {
                data: {
                    data: [
                        {
                            id: 456,
                        },
                    ],
                },
            },
        } as any)

        const { result } = renderHook(() =>
            useTicketViewData({ accountDomain: 'example' }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual({ viewId: 123, ticketId: 456 })
    })

    it('should return undefined ticketId and viewId if hooks are not successful', () => {
        useGetAccountConfigurationMock.mockReturnValue({
            status: 'error',
            data: undefined,
        } as any)
        useGetViewTicketUpdatesMock.mockReturnValue({
            status: 'idle',
            data: undefined,
        } as any)

        const { result } = renderHook(() =>
            useTicketViewData({ accountDomain: 'example' }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual({
            ticketId: undefined,
            viewId: undefined,
        })
    })

    it('should return undefined ticketId and viewId if account configuration has no Close view', () => {
        useGetAccountConfigurationMock.mockReturnValue({
            status: 'success',
            data: {
                data: {
                    accountConfiguration: {
                        views: { All: { id: 123 } },
                    },
                },
            },
        } as any)
        useGetViewTicketUpdatesMock.mockReturnValue({
            status: 'idle',
            data: undefined,
        } as any)

        const { result } = renderHook(() =>
            useTicketViewData({ accountDomain: 'example' }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual({
            ticketId: undefined,
            viewId: undefined,
        })
    })

    it('set correct retries when retries disabled', () => {
        const accountDomain = 'test-store'
        const refetchOnWindowFocus = false
        const retries = false

        useGetAccountConfigurationMock.mockReturnValue({
            status: 'success',
            data: {
                data: {
                    accountConfiguration: {
                        views: { Close: { id: 123 } },
                    },
                },
            },
        } as any)

        renderHook(() =>
            useTicketViewData({
                accountDomain,
                refetchOnWindowFocus,
                retries,
            }),
        )

        expect(useGetAccountConfigurationMock).toHaveBeenCalledWith(
            accountDomain,
            { refetchOnWindowFocus, retry: 0 },
        )
    })
})
