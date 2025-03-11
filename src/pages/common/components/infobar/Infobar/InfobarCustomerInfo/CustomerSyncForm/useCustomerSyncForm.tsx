import { useState } from 'react'

import { CountryCode } from 'libphonenumber-js'

const initialState: FormState = {
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
}
export type FormState = {
    store: number
    email: string
    name: string
    phone: string
    country: string
    countryCode: CountryCode | ''
    company: string
    address: string
    apartment: string
    city: string
    stateOrProvince: string
    postalCode: string
    deliveryAddressChecked: boolean
}

export const useCustomerSyncForm = () => {
    const [formState, setFormState] = useState<FormState>(initialState)
    const onChange = (changes: Partial<FormState>) =>
        setFormState({ ...formState, ...changes })

    const resetFormState = () => {
        setFormState(initialState)
    }

    const isFormValid = () => {
        if (formState.deliveryAddressChecked) {
            return (
                !!formState.email &&
                !!formState.store &&
                !!formState.countryCode &&
                !!formState.address &&
                !!formState.city &&
                !!formState.stateOrProvince &&
                !!formState.postalCode &&
                formState.postalCode.length > 1
            )
        }

        return !!formState.email && !!formState.store
    }

    return {
        formState,
        resetFormState,
        setFormState,
        onChange,
        isFormValid,
    }
}
