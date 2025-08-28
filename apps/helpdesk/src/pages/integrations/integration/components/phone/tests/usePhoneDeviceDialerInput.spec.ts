import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { UserSearchResult } from 'models/search/types'

import usePhoneDeviceDialerCustomerSuggestions from '../usePhoneDeviceDialerCustomerSuggestions'
import usePhoneDeviceDialerInput from '../usePhoneDeviceDialerInput'

jest.mock('../usePhoneDeviceDialerCustomerSuggestions')

const usePhoneDeviceDialerCustomerSuggestionsMock = assumeMock(
    usePhoneDeviceDialerCustomerSuggestions,
)

describe('usePhoneDeviceDialerInput', () => {
    const onValueChange = jest.fn()
    const resetError = jest.fn()
    const onCustomerEnter = jest.fn()
    const debouncedSearchCustomers = jest.fn() as any
    const handleInputKeyDown = jest.fn()

    const mockCustomers: UserSearchResult[] = [
        {
            id: 1,
            address: '+15551234567',
            customer: {
                id: 1,
                name: 'Guybrush Threepwood',
            },
        },
        {
            id: 2,
            address: '+15557654321',
            customer: {
                id: 2,
                name: 'Elaine Marley',
            },
        },
    ]

    const setup = () => {
        return renderHook(() =>
            usePhoneDeviceDialerInput({
                onValueChange,
                resetError,
                onCustomerEnter,
            }),
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        usePhoneDeviceDialerCustomerSuggestionsMock.mockReturnValue({
            isFetching: false,
            handleInputKeyDown,
            customers: [],
            highlightedResultIndex: null,
            handleSelectCustomer: jest.fn(),
            debouncedSearchCustomers,
        })
    })

    it('should initialize with default values', () => {
        const { result } = setup()

        expect(result.current.inputValue).toBe('')
        expect(result.current.selectedCustomer).toBeNull()
        expect(result.current.highlightedResultIndex).toBeNull()
        expect(result.current.isSearchTypeCustomer).toBe(false)
        expect(result.current.isSearchingCustomers).toBe(false)
        expect(result.current.phoneNumberInputRef.current).toBeNull()
        expect(result.current.textInputRef.current).toBeNull()
        expect(result.current.customers).toEqual([])
    })

    describe('handleChange', () => {
        it('should handle numeric input (phone number)', () => {
            const { result } = setup()

            act(() => {
                result.current.handleChange('+15551234567')
            })

            expect(result.current.inputValue).toBe('+15551234567')
            expect(onValueChange).toHaveBeenCalledWith('+15551234567')
            expect(resetError).toHaveBeenCalled()
            expect(result.current.isSearchTypeCustomer).toBe(false)
            expect(result.current.selectedCustomer).toBeNull()
            expect(debouncedSearchCustomers).toHaveBeenCalledWith(
                '+15551234567',
            )
        })

        it('should handle alphabetic input (customer name)', () => {
            const { result } = setup()

            act(() => {
                result.current.handleChange('Guybrush')
            })

            expect(result.current.inputValue).toBe('Guybrush')
            expect(onValueChange).toHaveBeenCalledWith('')
            expect(resetError).toHaveBeenCalled()
            expect(result.current.isSearchTypeCustomer).toBe(true)
            expect(result.current.selectedCustomer).toBeNull()
            expect(debouncedSearchCustomers).toHaveBeenCalledWith('Guybrush')
        })

        it('should handle mixed alphanumeric input as customer search', () => {
            const { result } = setup()

            act(() => {
                result.current.handleChange('Guybrush123')
            })

            expect(result.current.inputValue).toBe('Guybrush123')
            expect(onValueChange).toHaveBeenCalledWith('')
            expect(resetError).toHaveBeenCalled()
            expect(result.current.isSearchTypeCustomer).toBe(true)
            expect(result.current.selectedCustomer).toBeNull()
            expect(debouncedSearchCustomers).toHaveBeenCalledWith('Guybrush123')
        })

        it('should clear selected customer when input changes', () => {
            const { result } = setup()

            act(() => {
                result.current.handleSelectCustomer(mockCustomers[0])
            })

            expect(result.current.selectedCustomer).toBe(mockCustomers[0])

            act(() => {
                result.current.handleChange('Elaine')
            })

            expect(result.current.selectedCustomer).toBeNull()
        })

        it('should handle empty input', () => {
            const { result } = setup()

            act(() => {
                result.current.handleChange('')
            })

            expect(result.current.inputValue).toBe('')
            expect(result.current.isSearchTypeCustomer).toBe(false)
            expect(onValueChange).toHaveBeenCalledWith('')
            expect(resetError).toHaveBeenCalled()
            expect(debouncedSearchCustomers).toHaveBeenCalledWith('')
        })
    })

    describe('handleSelectCustomer', () => {
        it('should select a customer and update input', () => {
            const { result } = setup()
            const customer = mockCustomers[0]

            act(() => {
                result.current.handleSelectCustomer(customer)
            })

            expect(result.current.inputValue).toBe('Guybrush Threepwood')
            expect(onValueChange).toHaveBeenCalledWith('+15551234567', customer)
            expect(resetError).toHaveBeenCalled()
            expect(result.current.selectedCustomer).toBe(customer)
        })

        it('should replace previously selected customer', () => {
            const { result } = setup()

            act(() => {
                result.current.handleSelectCustomer(mockCustomers[0])
            })

            expect(result.current.inputValue).toBe('Guybrush Threepwood')
            expect(result.current.selectedCustomer).toBe(mockCustomers[0])

            act(() => {
                result.current.handleSelectCustomer(mockCustomers[1])
            })

            expect(result.current.inputValue).toBe('Elaine Marley')
            expect(result.current.selectedCustomer).toBe(mockCustomers[1])
            expect(onValueChange).toHaveBeenLastCalledWith(
                '+15557654321',
                mockCustomers[1],
            )
        })
    })

    describe('customer suggestions integration', () => {
        it('should pass correct configuration', () => {
            const { result } = setup()

            expect(
                usePhoneDeviceDialerCustomerSuggestionsMock,
            ).toHaveBeenCalledWith({
                onEnter: onCustomerEnter,
                onCustomerSelect: result.current.handleSelectCustomer,
                minSearchInputLength: 5,
            })
        })

        it('should update minSearchInputLength based on search type', () => {
            const { result, rerender } = setup()

            expect(
                usePhoneDeviceDialerCustomerSuggestionsMock,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    minSearchInputLength: 5,
                }),
            )

            act(() => {
                result.current.handleChange('Guybrush')
            })

            rerender()

            expect(
                usePhoneDeviceDialerCustomerSuggestionsMock,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    minSearchInputLength: 3,
                }),
            )
        })

        it('should expose customers and related data from suggestions hook', () => {
            usePhoneDeviceDialerCustomerSuggestionsMock.mockReturnValue({
                isFetching: true,
                handleInputKeyDown,
                handleSelectCustomer: jest.fn(),
                customers: mockCustomers,
                highlightedResultIndex: 1,
                debouncedSearchCustomers,
            })

            const { result } = setup()

            expect(result.current.customers).toBe(mockCustomers)
            expect(result.current.highlightedResultIndex).toBe(1)
            expect(result.current.isSearchingCustomers).toBe(true)
            expect(result.current.handleInputKeyDown).toBe(handleInputKeyDown)
        })
    })
})
