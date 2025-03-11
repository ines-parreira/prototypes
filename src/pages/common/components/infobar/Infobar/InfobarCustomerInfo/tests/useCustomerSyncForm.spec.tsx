import { act, renderHook } from '@testing-library/react-hooks'

import { useCustomerSyncForm } from '../CustomerSyncForm/useCustomerSyncForm'

describe('useCustomerSyncForm', () => {
    it('should initialize form state correctly', () => {
        const { result } = renderHook(() => useCustomerSyncForm())
        expect(result.current.formState).toEqual({
            store: NaN,
            email: '',
            name: '',
            phone: '',
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            postalCode: '',
            stateOrProvince: '',
            deliveryAddressChecked: false,
        })
    })

    it('should update form state on change', () => {
        const { result } = renderHook(() => useCustomerSyncForm())
        act(() => {
            result.current.onChange({ email: 'test@example.com' })
        })
        expect(result.current.formState.email).toBe('test@example.com')
    })

    it('should reset form state', () => {
        const { result } = renderHook(() => useCustomerSyncForm())
        act(() => {
            result.current.onChange({ email: 'test@example.com' })
            result.current.resetFormState()
        })
        expect(result.current.formState).toEqual({
            store: NaN,
            email: '',
            name: '',
            phone: '',
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            postalCode: '',
            stateOrProvince: '',
            deliveryAddressChecked: false,
        })
    })

    it('should validate form correctly', () => {
        const { result } = renderHook(() => useCustomerSyncForm())
        act(() => {
            result.current.onChange({ email: 'test@example.com', store: 1 })
        })
        expect(result.current.isFormValid()).toBe(true)

        act(() => {
            result.current.onChange({ deliveryAddressChecked: true })
        })
        expect(result.current.isFormValid()).toBe(false)

        act(() => {
            result.current.onChange({
                address: '123 Main St',
                city: 'anyCity',
                stateOrProvince: 'CA',
                postalCode: '12345',
                countryCode: 'US',
            })
        })
        expect(result.current.isFormValid()).toBe(true)
    })
})
