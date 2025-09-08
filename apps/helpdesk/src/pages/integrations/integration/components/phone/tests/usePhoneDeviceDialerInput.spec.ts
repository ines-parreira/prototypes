import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { isValidNumber } from 'libphonenumber-js'

import { UserSearchResult } from 'models/search/types'

import usePhoneDeviceDialerCustomerSuggestions from '../usePhoneDeviceDialerCustomerSuggestions'
import usePhoneDeviceDialerInput from '../usePhoneDeviceDialerInput'

jest.mock('../usePhoneDeviceDialerCustomerSuggestions')
jest.mock('libphonenumber-js')

const usePhoneDeviceDialerCustomerSuggestionsMock = assumeMock(
    usePhoneDeviceDialerCustomerSuggestions,
)
const isValidNumberMock = assumeMock(isValidNumber)

describe('usePhoneDeviceDialerInput', () => {
    const onValueChange = jest.fn()
    const onValidationChange = jest.fn()
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

    const setup = (value?: {
        phoneNumber: string
        customer?: UserSearchResult
    }) => {
        return renderHook(() =>
            usePhoneDeviceDialerInput({
                value,
                onValueChange,
                onValidationChange,
                onCustomerEnter,
            }),
        )
    }

    beforeEach(() => {
        jest.useFakeTimers()
        jest.clearAllMocks()
        isValidNumberMock.mockReturnValue(true)
        usePhoneDeviceDialerCustomerSuggestionsMock.mockReturnValue({
            isFetching: false,
            handleInputKeyDown,
            customers: [],
            highlightedResultIndex: null,
            handleSelectCustomer: jest.fn(),
            debouncedSearchCustomers,
        })
    })

    afterEach(() => {
        jest.useRealTimers()
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
            expect(onValidationChange).toHaveBeenCalledWith(false)
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
            expect(onValidationChange).toHaveBeenCalledWith(false)
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
            expect(onValidationChange).toHaveBeenCalledWith(false)
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
            expect(onValidationChange).toHaveBeenCalledWith(false)
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
            expect(onValidationChange).toHaveBeenCalledWith(true)
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

    describe('phone number validation', () => {
        it('should validate valid phone number after debounce', async () => {
            isValidNumberMock.mockReturnValue(true)
            const { result } = setup()

            act(() => {
                result.current.handleChange('+15551234567')
            })

            expect(onValidationChange).toHaveBeenCalledWith(false)
            expect(result.current.phoneNumberError).toBeUndefined()

            act(() => {
                jest.advanceTimersByTime(500)
            })

            expect(isValidNumberMock).toHaveBeenCalledWith('+15551234567')
            expect(onValidationChange).toHaveBeenCalledWith(true)
            expect(result.current.phoneNumberError).toBeUndefined()
        })

        it('should validate invalid phone number after debounce', async () => {
            isValidNumberMock.mockReturnValue(false)
            const { result } = setup()

            act(() => {
                result.current.handleChange('+123')
            })

            expect(onValidationChange).toHaveBeenCalledWith(false)
            expect(result.current.phoneNumberError).toBeUndefined()

            act(() => {
                jest.advanceTimersByTime(500)
            })

            expect(isValidNumberMock).toHaveBeenCalledWith('+123')
            expect(onValidationChange).toHaveBeenCalledWith(false)
            expect(result.current.phoneNumberError).toBe('Invalid phone number')
        })

        it('should cancel validation when switching to customer search', () => {
            const { result } = setup()

            act(() => {
                result.current.handleChange('+15551234567')
            })

            expect(onValidationChange).toHaveBeenCalledWith(false)

            act(() => {
                result.current.handleChange('Guybrush')
            })

            expect(onValidationChange).toHaveBeenCalledTimes(2)
            expect(onValidationChange).toHaveBeenLastCalledWith(false)

            act(() => {
                jest.advanceTimersByTime(500)
            })

            expect(isValidNumberMock).not.toHaveBeenCalled()
            expect(result.current.phoneNumberError).toBeUndefined()
        })

        it('should cancel validation when selecting customer', () => {
            const { result } = setup()

            act(() => {
                result.current.handleChange('+15551234567')
            })

            expect(onValidationChange).toHaveBeenCalledWith(false)

            act(() => {
                result.current.handleSelectCustomer(mockCustomers[0])
            })

            expect(onValidationChange).toHaveBeenCalledTimes(2)
            expect(onValidationChange).toHaveBeenLastCalledWith(true)

            act(() => {
                jest.advanceTimersByTime(500)
            })

            expect(isValidNumberMock).not.toHaveBeenCalled()
            expect(result.current.phoneNumberError).toBeUndefined()
        })
    })

    describe('controlled component behavior', () => {
        it('uses values prop with only phone number', () => {
            const value = { phoneNumber: '+15551234567', customer: undefined }
            const { result } = setup(value)

            expect(result.current.inputValue).toBe('+15551234567')
            expect(result.current.selectedCustomer).toBeNull()
        })

        it('uses value prop with customer when provided', () => {
            const value = {
                phoneNumber: '+15551234567',
                customer: mockCustomers[0],
            }
            const { result } = setup(value)

            expect(result.current.inputValue).toBe('+15551234567')
            expect(result.current.selectedCustomer).toBe(mockCustomers[0])
        })

        it('uses internal state when searching for customer but value has no customer', () => {
            const value = {
                phoneNumber: '+15551234567',
                customer: undefined,
            }
            const { result } = setup(value)

            act(() => {
                result.current.handleChange('Guy')
            })

            expect(result.current.inputValue).toBe('Guy')
            expect(result.current.selectedCustomer).toBeNull()
            expect(result.current.isSearchTypeCustomer).toBe(true)
        })

        it('uses customer name from value when searching for customer and we have a customer', () => {
            const value = {
                phoneNumber: '+15551234567',
                customer: mockCustomers[0],
            }
            const { result } = setup(value)

            act(() => {
                result.current.handleChange('Guybrush')
            })

            expect(result.current.inputValue).toBe('Guybrush Threepwood')
            expect(result.current.selectedCustomer).toBe(mockCustomers[0])
            expect(result.current.isSearchTypeCustomer).toBe(true)
        })
    })
})
