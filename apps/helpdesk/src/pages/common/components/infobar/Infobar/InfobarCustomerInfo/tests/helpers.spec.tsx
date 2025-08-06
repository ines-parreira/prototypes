import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { IntegrationType } from 'models/integration/types'

import {
    getDefaultAddressInfoFromActiveCustomer,
    getPhoneNumberFromActiveCustomer,
    useShouldShowProfileSync,
} from '../helpers'

const mockStore = configureStore([])

describe('useShouldShowProfileSync', () => {
    const store = mockStore({
        integrations: fromJS({
            integrations: [{ type: 'shopify' }],
        }),
    })

    it('should return false if isEditing is true', () => {
        const { result } = renderHook(
            () => useShouldShowProfileSync(true, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(false)
    })

    it('should return false if there are no shopify integrations', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        })
        const { result } = renderHook(
            () => useShouldShowProfileSync(false, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(false)
    })

    it('should return true if there is a shopify integration, flag is on, editing is false and customerIntegrationsData is  empty', () => {
        const { result } = renderHook(
            () => useShouldShowProfileSync(false, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(true)
    })
})

describe('getPhoneNumberFromActiveCustomer', () => {})

describe('getPhoneNumberFromActiveCustomer', () => {
    it('should return the phone number when phone integration exists', () => {
        const activeCustomer = Map({
            channels: [
                Map({ type: IntegrationType.Phone, address: '123-456-7890' }),
            ],
        })

        const phoneNumber = getPhoneNumberFromActiveCustomer(activeCustomer)
        expect(phoneNumber).toBe('123-456-7890')
    })

    it('should return an empty string when phone integration does not exist', () => {
        const activeCustomer = Map({
            channels: [
                Map({
                    type: IntegrationType.Email,
                    address: 'test@example.com',
                }),
            ],
        })

        const phoneNumber = getPhoneNumberFromActiveCustomer(activeCustomer)
        expect(phoneNumber).toBe('')
    })

    it('should return an empty string when channels are not present', () => {
        const activeCustomer = Map({})

        const phoneNumber = getPhoneNumberFromActiveCustomer(activeCustomer)
        expect(phoneNumber).toBe('')
    })

    it('should return an empty string when activeCustomer is undefined', () => {
        expect(getPhoneNumberFromActiveCustomer(undefined)).toBe('')
    })
})

describe('getDefaultAddressInfoFromActiveCustomer', () => {
    it('should return default address info when all data is present', () => {
        const activeCustomer = fromJS({
            integrations: {
                123: {
                    customer: {
                        default_address: {
                            country: 'United States',
                            country_code: 'US',
                            company: 'Acme Corp',
                            address1: '123 Main St',
                            address2: 'Apt 123',
                            city: 'New York',
                            province: 'NY',
                            zip: '10001',
                            phone: '+1-555-123-4567',
                        },
                    },
                },
            },
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            123,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: 'Acme Corp',
            address: '123 Main St',
            apartment: 'Apt 123',
            city: 'New York',
            stateOrProvince: 'NY',
            postalCode: '10001',
            defaultAddressPhone: '+1-555-123-4567',
        })
    })

    it('should handle missing fields with empty strings', () => {
        const activeCustomer = fromJS({
            integrations: {
                456: {
                    customer: {
                        default_address: {
                            city: 'Toronto',
                        },
                    },
                },
            },
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            456,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: 'Toronto',
            stateOrProvince: '',
            postalCode: '',
            defaultAddressPhone: '',
        })
    })

    it('should handle when default_address is missing', () => {
        const activeCustomer = fromJS({
            integrations: {
                789: {
                    customer: {},
                },
            },
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            789,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            stateOrProvince: '',
            postalCode: '',
            defaultAddressPhone: '',
        })
    })

    it('should handle when customer is missing', () => {
        const activeCustomer = fromJS({
            integrations: {
                101: {},
            },
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            101,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            stateOrProvince: '',
            postalCode: '',
            defaultAddressPhone: '',
        })
    })

    it('should handle when integration is missing', () => {
        const activeCustomer = fromJS({
            integrations: {},
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            999,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            stateOrProvince: '',
            postalCode: '',
            defaultAddressPhone: '',
        })
    })
})
