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
    const [loadedStore, setLoadedStore] = useState<number | null>(null)

    useEffect(() => {
        if (
            activeCustomer &&
            formState.store &&
            loadedStore !== formState.store
        ) {
            const defaultAddressInfo = getDefaultAddressInfoFromActiveCustomer(
                activeCustomer,
                formState.store,
            )
            setFormState((prevState) => ({
                ...prevState,
                ...defaultAddressInfo,
            }))
            setLoadedStore(formState.store)
        }
    }, [activeCustomer, formState.store, loadedStore])

    const onChange = useCallback((changes: Partial<FormState>) => {
        setFormState((prevState) => ({ ...prevState, ...changes }))
    }, [])

    const resetFormState = useCallback(() => {
        setFormState({
            ...initialState,
            name: activeCustomer.get('name'),
            email: activeCustomer.get('email'),
            phone: getPhoneNumberFromActiveCustomer(activeCustomer),
        })
        setLoadedStore(null)
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
