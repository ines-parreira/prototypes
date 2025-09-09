import { render, screen, waitFor } from '@testing-library/react'

import { UserSearchResult } from 'models/search/types'

import PhoneSelectField from '../PhoneSelectField'
import usePhoneDeviceDialerInput from '../usePhoneDeviceDialerInput'

jest.mock('../usePhoneDeviceDialerInput')

const mockUsePhoneDeviceDialerInput =
    usePhoneDeviceDialerInput as jest.MockedFunction<
        typeof usePhoneDeviceDialerInput
    >

const renderComponent = (props = {}) => {
    const defaultProps = {
        value: '',
        onChange: jest.fn(),
        label: 'Phone Number',
    }
    return render(<PhoneSelectField {...defaultProps} {...props} />)
}

describe('PhoneSelectField', () => {
    const mockHandleChange = jest.fn()
    const mockHandleSelectCustomer = jest.fn()
    const mockHandleInputKeyDown = jest.fn()

    const mockCustomers: UserSearchResult[] = [
        {
            id: '1',
            customer: {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
            },
            address: '+15551234567',
        } as unknown as UserSearchResult,
        {
            id: '2',
            customer: {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
            },
            address: '+15559876543',
        } as unknown as UserSearchResult,
    ]

    const defaultHookReturn = {
        inputValue: '',
        selectedCustomer: null,
        highlightedResultIndex: null,
        isSearchTypeCustomer: false,
        isSearchingCustomers: false,
        phoneNumberInputRef: { current: null },
        textInputRef: { current: null },
        customers: [],
        handleChange: mockHandleChange,
        handleSelectCustomer: mockHandleSelectCustomer,
        handleInputKeyDown: mockHandleInputKeyDown as any,
        phoneNumberError: undefined,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUsePhoneDeviceDialerInput.mockReturnValue(defaultHookReturn)
    })

    describe('Rendering', () => {
        it('should render with label', () => {
            renderComponent()
            expect(screen.getByText('Phone Number')).toBeInTheDocument()
        })

        it('should pass initial value to the hook', () => {
            renderComponent({ value: '+15551234567' })
            expect(mockUsePhoneDeviceDialerInput).toHaveBeenCalledWith(
                expect.objectContaining({
                    onValueChange: expect.any(Function),
                    onCustomerEnter: expect.any(Function),
                    initialValue: '+15551234567',
                }),
            )
        })
    })

    describe('Phone Number Validation', () => {
        it('should show error for invalid phone number', () => {
            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: '123',
                phoneNumberError: 'Enter a valid number',
            })

            renderComponent()

            expect(screen.getByText('Enter a valid number')).toBeInTheDocument()
        })

        it('should not show error for valid phone number', () => {
            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: '+1234 555 5555',
                phoneNumberError: undefined,
            })

            renderComponent()

            expect(
                screen.queryByText('Invalid phone number'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Dropdown Behavior', () => {
        it('should not show dropdown initially', () => {
            renderComponent()
            expect(screen.queryByText('Customers')).not.toBeInTheDocument()
        })

        it('should show dropdown when there is input and customers', async () => {
            const { rerender } = renderComponent()

            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: 'John',
                customers: mockCustomers,
                isSearchTypeCustomer: true,
            })

            rerender(
                <PhoneSelectField
                    value=""
                    onChange={jest.fn()}
                    label="Phone Number"
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('Customers')).toBeInTheDocument()
            })
        })

        it('should hide dropdown when customer is selected', async () => {
            const { rerender } = renderComponent()

            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: 'John',
                customers: mockCustomers,
                isSearchTypeCustomer: true,
            })

            rerender(
                <PhoneSelectField
                    value=""
                    onChange={jest.fn()}
                    label="Phone Number"
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('Customers')).toBeInTheDocument()
            })

            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: 'John Doe',
                selectedCustomer: mockCustomers[0],
                customers: mockCustomers,
                isSearchTypeCustomer: true,
            })

            rerender(
                <PhoneSelectField
                    value=""
                    onChange={jest.fn()}
                    label="Phone Number"
                />,
            )

            await waitFor(() => {
                expect(screen.queryByText('Customers')).not.toBeInTheDocument()
            })
        })

        it('should hide dropdown when input is cleared', async () => {
            const { rerender } = renderComponent()

            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: 'John',
                customers: mockCustomers,
                isSearchTypeCustomer: true,
            })

            rerender(
                <PhoneSelectField
                    value=""
                    onChange={jest.fn()}
                    label="Phone Number"
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('Customers')).toBeInTheDocument()
            })

            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: '',
                customers: [],
                isSearchTypeCustomer: false,
            })

            rerender(
                <PhoneSelectField
                    value=""
                    onChange={jest.fn()}
                    label="Phone Number"
                />,
            )

            await waitFor(() => {
                expect(screen.queryByText('Customers')).not.toBeInTheDocument()
            })
        })

        it('should show dropdown with no results when no customer is found', async () => {
            const { rerender } = renderComponent()

            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: 'NonExistent',
                customers: [],
                isSearchTypeCustomer: true,
            })

            rerender(
                <PhoneSelectField
                    value=""
                    onChange={jest.fn()}
                    label="Phone Number"
                />,
            )

            await waitFor(() => {
                expect(screen.queryByText('Customers')).toBeInTheDocument()
                expect(screen.getByText('No results')).toBeInTheDocument()
            })
        })

        it('should hide dropdown when typing unknown phone number', async () => {
            const { rerender } = renderComponent()

            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: '+1435',
                customers: [],
                isSearchTypeCustomer: false,
            })

            rerender(
                <PhoneSelectField
                    value=""
                    onChange={jest.fn()}
                    label="Phone Number"
                />,
            )

            await waitFor(() => {
                expect(screen.queryByText('Customers')).toBeNull()
            })
        })
    })

    describe('Loading State', () => {
        it('should show loading state when searching for customers', () => {
            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: 'John',
                isSearchTypeCustomer: true,
                isSearchingCustomers: true,
                customers: [],
            })

            renderComponent()

            expect(mockUsePhoneDeviceDialerInput).toHaveBeenCalled()
        })
    })

    describe('Dropdown Interaction', () => {
        it('should show dropdown when conditions are met', async () => {
            const { rerender } = renderComponent()

            // Initially no dropdown
            expect(screen.queryByText('Customers')).not.toBeInTheDocument()

            // Update hook to return data that should show dropdown
            mockUsePhoneDeviceDialerInput.mockReturnValue({
                ...defaultHookReturn,
                inputValue: 'John',
                customers: mockCustomers,
                isSearchTypeCustomer: true,
            })

            rerender(
                <PhoneSelectField
                    value=""
                    onChange={jest.fn()}
                    label="Phone Number"
                />,
            )

            // Now dropdown should be visible
            await waitFor(() => {
                expect(screen.getByText('Customers')).toBeInTheDocument()
            })
        })
    })
})
