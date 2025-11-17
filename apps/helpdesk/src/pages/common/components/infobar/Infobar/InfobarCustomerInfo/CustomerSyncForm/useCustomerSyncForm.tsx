import { useCallback, useEffect, useState } from 'react'

import type { Map } from 'immutable'
import type { CountryCode } from 'libphonenumber-js'

import {
    getDefaultAddressInfoFromActiveCustomer,
    getPhoneNumberFromActiveCustomer,
} from '../helpers'

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
    defaultAddressPhone: '',
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
    defaultAddressPhone: string
}

export const useCustomerSyncForm = (activeCustomer: Map<string, any>) => {
    const [formState, setFormState] = useState<FormState>({
        ...initialState,
        name: activeCustomer.get('name'),
        email: activeCustomer.get('email'),
        phone: getPhoneNumberFromActiveCustomer(activeCustomer),
    })

    useEffect(() => {
        if (activeCustomer && formState.store) {
            const defaultAddressInfo = getDefaultAddressInfoFromActiveCustomer(
                activeCustomer,
                formState.store,
            )
            setFormState((formState) => ({
                ...formState,
                ...defaultAddressInfo,
            }))
        }
    }, [activeCustomer, formState.store])

    const onChange = (changes: Partial<FormState>) =>
        setFormState({ ...formState, ...changes })

    const resetFormState = useCallback(() => {
        setFormState({
            ...initialState,
            name: activeCustomer.get('name'),
            email: activeCustomer.get('email'),
            phone: getPhoneNumberFromActiveCustomer(activeCustomer),
        })
    }, [activeCustomer])

    const resetEmailState = useCallback(() => {
        setFormState((prevState) => ({
            ...prevState,
            email: activeCustomer.get('email'),
        }))
    }, [activeCustomer])

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
        resetEmailState,
        setFormState,
        onChange,
        isFormValid,
    }
}
