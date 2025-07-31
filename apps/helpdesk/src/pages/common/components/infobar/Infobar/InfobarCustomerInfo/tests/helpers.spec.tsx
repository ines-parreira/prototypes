import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { IntegrationType } from 'models/integration/types'

import {
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
