import {renderHook, act} from '@testing-library/react-hooks'
import {isValidPhoneNumber} from 'libphonenumber-js'

import React from 'react'

import {UserSearchResult} from 'models/search/types'
import {getCountryFromPhoneNumber} from 'pages/phoneNumbers/utils'
import * as selectors from 'state/integrations/selectors'
import {assumeMock} from 'utils/testing'

import useDialerOutboundCall from '../useDialerOutboundCall'
import usePhoneDeviceDialer from '../usePhoneDeviceDialer'
import usePhoneDeviceDialerCustomerSuggestions from '../usePhoneDeviceDialerCustomerSuggestions'
import usePhoneNumbers from '../usePhoneNumbers'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock(
    'pages/integrations/integration/components/phone/useDialerOutboundCall'
)
jest.mock(
    'pages/integrations/integration/components/phone/usePhoneDeviceDialerCustomerSuggestions'
)
jest.mock('libphonenumber-js')
jest.mock('../usePhoneNumbers')
jest.mock('pages/phoneNumbers/utils')

const isValidPhoneNumberMock = assumeMock(isValidPhoneNumber)
const useDialerOutboundCallMock = assumeMock(useDialerOutboundCall)
const usePhoneDeviceDialerCustomerSuggestionsMock = assumeMock(
    usePhoneDeviceDialerCustomerSuggestions
)
const usePhoneNumbersMock = assumeMock(usePhoneNumbers)
const getCountryFromPhoneNumberMock = assumeMock(getCountryFromPhoneNumber)

const getPhoneIntegrationsSpy = jest.spyOn(selectors, 'getPhoneIntegrations')

describe('usePhoneDeviceDialer', () => {
    const mockPhoneIntegrations = [
        {
            id: 1,
            name: 'testIntegration',
            meta: {
                phone_number_id: 1,
            },
        },
        {
            id: 2,
            name: 'otherTestIntegration2',
            meta: {
                phone_number_id: 2,
            },
        },
    ]
    const mockUserSearchResult: UserSearchResult = {
        customer: {name: 'John Doe'},
        id: 'user1',
    } as any
    const mockMakeCall = jest.fn()
    const mockOnCallInitiated = jest.fn()
    const mockDebouncedSearchCustomers = jest.fn()

    beforeEach(() => {
        useDialerOutboundCallMock.mockReturnValue(mockMakeCall)
        getPhoneIntegrationsSpy.mockReturnValue(mockPhoneIntegrations as any)
        ;(usePhoneDeviceDialerCustomerSuggestions as jest.Mock).mockReturnValue(
            {
                isFetching: false,
                handleInputKeyDown: jest.fn(),
                customers: [],
                highlightedResultIndex: -1,
                debouncedSearchCustomers: mockDebouncedSearchCustomers,
            }
        )
        usePhoneNumbersMock.mockReturnValue({
            getPhoneNumberById: jest.fn(() => ({phone_number: '1234567890'})),
        } as any)
    })

    it('should initialize with default values', () => {
        const {result} = renderHook(() =>
            usePhoneDeviceDialer({onCallInitiated: mockOnCallInitiated})
        )

        expect(result.current.inputValue).toBe('')
        expect(result.current.selectedCustomer).toBeNull()
        expect(result.current.phoneNumberInputError).toBeUndefined()
        expect(result.current.phoneIntegrations).toEqual(mockPhoneIntegrations)
        expect(result.current.selectedIntegration).toEqual(
            mockPhoneIntegrations[0]
        )
        expect(result.current.isSearchTypeCustomer).toBe(false)
        expect(result.current.isSearchingCustomers).toBe(false)
        expect(result.current.isCallButtonDisabled).toBe(false)
    })

    it('should handle input change', () => {
        const {result} = renderHook(() =>
            usePhoneDeviceDialer({onCallInitiated: mockOnCallInitiated})
        )

        act(() => {
            result.current.handleChange('1234567890')
        })

        expect(result.current.inputValue).toBe('1234567890')
        expect(result.current.selectedCustomer).toBeNull()
        expect(result.current.phoneNumberInputError).toBeUndefined()
        expect(mockDebouncedSearchCustomers).toHaveBeenCalledWith('1234567890')
    })

    it('should handle customer selection', () => {
        const {result} = renderHook(() =>
            usePhoneDeviceDialer({onCallInitiated: mockOnCallInitiated})
        )

        act(() => {
            result.current.handleSelectCustomer(mockUserSearchResult)
        })

        expect(result.current.inputValue).toBe('John Doe')
        expect(result.current.selectedCustomer).toEqual(mockUserSearchResult)
    })

    it('should handle call click with valid phone number', () => {
        isValidPhoneNumberMock.mockReturnValue(true)
        const {result} = renderHook(() =>
            usePhoneDeviceDialer({onCallInitiated: mockOnCallInitiated})
        )

        act(() => {
            result.current.handleChange('1234567890')
        })

        act(() => {
            result.current.handleCallClick()
        })

        expect(mockMakeCall).toHaveBeenCalled()
        expect(mockOnCallInitiated).toHaveBeenCalled()
    })

    it('should handle call click with invalid phone number', () => {
        isValidPhoneNumberMock.mockReturnValue(false)
        const {result} = renderHook(() =>
            usePhoneDeviceDialer({onCallInitiated: mockOnCallInitiated})
        )

        act(() => {
            result.current.handleChange('123')
        })

        act(() => {
            result.current.handleCallClick()
        })

        expect(result.current.phoneNumberInputError).toBe(
            'Enter a valid number'
        )
        expect(mockMakeCall).not.toHaveBeenCalled()
        expect(mockOnCallInitiated).not.toHaveBeenCalled()
    })

    it('should disable call button if search type is customer and no customer is selected', () => {
        const {result} = renderHook(() =>
            usePhoneDeviceDialer({onCallInitiated: mockOnCallInitiated})
        )

        act(() => {
            result.current.handleChange('John')
        })

        expect(result.current.isCallButtonDisabled).toBe(true)
    })

    it('should trigger search after the minimum amount of characters have been entered for number input', () => {
        const {result} = renderHook(() =>
            usePhoneDeviceDialer({onCallInitiated: mockOnCallInitiated})
        )

        act(() => {
            result.current.handleChange('123')
        })

        expect(result.current.isSearchTypeCustomer).toBe(false)
        expect(
            usePhoneDeviceDialerCustomerSuggestionsMock
        ).toHaveBeenLastCalledWith(
            expect.objectContaining({minSearchInputLength: 5})
        )
    })

    it('should trigger search after the minimum amount of characters have been entered for customer input', () => {
        const {result} = renderHook(() =>
            usePhoneDeviceDialer({onCallInitiated: mockOnCallInitiated})
        )

        act(() => {
            result.current.handleChange('John')
        })

        expect(result.current.isSearchTypeCustomer).toBe(true)
        expect(
            usePhoneDeviceDialerCustomerSuggestionsMock
        ).toHaveBeenLastCalledWith(
            expect.objectContaining({minSearchInputLength: 3})
        )
    })

    it('should return default country code', () => {
        getCountryFromPhoneNumberMock.mockReturnValueOnce('US')
        const onCountryChange = jest.fn()
        jest.spyOn(React, 'createRef').mockReturnValue({
            current: {onCountryChange},
        } as any)

        const {result, rerender} = renderHook(() =>
            usePhoneDeviceDialer({onCallInitiated: mockOnCallInitiated})
        )

        getCountryFromPhoneNumberMock.mockReturnValue('FR')
        rerender()

        act(() => {
            result.current.setSelectedIntegration(
                mockPhoneIntegrations[1] as any
            )
        })

        expect(result.current.selectedIntegration).toEqual(
            mockPhoneIntegrations[1]
        )

        expect(onCountryChange).toHaveBeenCalledWith('FR')
    })
})
