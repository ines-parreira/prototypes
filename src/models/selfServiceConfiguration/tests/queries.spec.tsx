import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import { useGetSelfServiceConfiguration } from '../queries'
import { fetchSelfServiceConfigurationSSP } from '../resources'

jest.mock('../resources', () => ({
    fetchSelfServiceConfigurationSSP: jest.fn(),
    updateSelfServiceConfigurationSSP: jest.fn(),
}))

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})
describe('useGetSelfServiceConfiguration', () => {
    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
    beforeEach(() => {
        queryClient.clear()
    })
    it('should fetch self-service configuration when not deleted', async () => {
        const selfServiceConfig = { id: 1 }

        ;(fetchSelfServiceConfigurationSSP as jest.Mock).mockResolvedValueOnce(
            selfServiceConfig,
        )

        const { result } = renderHook(
            () => useGetSelfServiceConfiguration('testType', 'testShop'),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.status).toBe('success')
        })

        expect(fetchSelfServiceConfigurationSSP).toHaveBeenCalledWith(
            'testShop',
            'testType',
        )
        expect(result.current.data).toEqual({
            id: 1,
        })
    })
})
