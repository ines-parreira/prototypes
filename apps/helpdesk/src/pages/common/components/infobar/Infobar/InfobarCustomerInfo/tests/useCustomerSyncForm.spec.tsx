import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useCustomerSyncForm } from '../CustomerSyncForm/useCustomerSyncForm'

describe('useCustomerSyncForm', () => {
    const mockActiveCustomer = fromJS({
        name: 'John Smith',
        email: 'john@email.com',
    })

    it('should initialize form state correctly', () => {
        const { result } = renderHook(() =>
            useCustomerSyncForm(mockActiveCustomer),
        )
        expect(result.current.formState).toEqual({
            store: NaN,
            email: mockActiveCustomer.get('email'),
            name: mockActiveCustomer.get('name'),
            phone: '',
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            postalCode: '',
            stateOrProvince: '',
            defaultAddressPhone: '',
            deliveryAddressChecked: false,
        })
    })

    it('should update form state on change', () => {
        const { result } = renderHook(() =>
            useCustomerSyncForm(mockActiveCustomer),
        )
        act(() => {
            result.current.onChange({ email: 'test@example.com' })
        })
        expect(result.current.formState.email).toBe('test@example.com')
    })

    it('should reset form state', () => {
        const { result } = renderHook(() =>
            useCustomerSyncForm(mockActiveCustomer),
        )
        act(() => {
            result.current.onChange({ email: 'test@example.com' })
            result.current.resetFormState()
        })
        expect(result.current.formState).toEqual({
            store: NaN,
            email: mockActiveCustomer.get('email'),
            name: mockActiveCustomer.get('name'),
            phone: '',
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            postalCode: '',
            stateOrProvince: '',
            defaultAddressPhone: '',
            deliveryAddressChecked: false,
        })
    })

    it('should validate form correctly', () => {
        const { result } = renderHook(() =>
            useCustomerSyncForm(mockActiveCustomer),
        )
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
