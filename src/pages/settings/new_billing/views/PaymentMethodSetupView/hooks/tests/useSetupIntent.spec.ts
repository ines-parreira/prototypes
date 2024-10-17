import {useCreateBillingPaymentMethodSetup} from '@gorgias/api-queries'
import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'

import {useSetupIntent} from '../useSetupIntent'

jest.mock('@gorgias/api-queries')

const renderUseSetupIntentHook = (
    useCreateBillingPaymentMethodSetupReturnValue: Partial<
        ReturnType<typeof useCreateBillingPaymentMethodSetup>
    > = {}
) => {
    const mockMutate = jest.fn()

    assumeMock(useCreateBillingPaymentMethodSetup).mockReturnValue({
        mutate: mockMutate,
        ...useCreateBillingPaymentMethodSetupReturnValue,
    } as any)

    return {
        ...renderHook(useSetupIntent),
        mockMutate,
    }
}

describe('useSetupIntent hook', () => {
    it('should call startSetupIntent on mount', async () => {
        const {mockMutate} = renderUseSetupIntentHook()

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledTimes(1)
        })
    })

    it('should return the client secret from setupIntent', () => {
        const {result} = renderUseSetupIntentHook({
            data: {data: {client_secret: 'test_client_secret'}} as any,
        })

        expect(result.current.clientSecret).toBe('test_client_secret')
    })

    it('should return status properties', () => {
        const {result} = renderUseSetupIntentHook({
            isLoading: false,
            isError: false,
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })
})
