import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'

import {
    useListCustomerIntegrationsWithChannelDefault,
    useScheduleShopifyCreateNewCustomerAction,
    useScheduleShopifyUpdateCustomerAction,
} from '@gorgias/helpdesk-queries'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import CustomerSyncForm from '../CustomerSyncForm/CustomerSyncForm'

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions')
const mockNotify = assumeMock(notify)

jest.mock('@gorgias/helpdesk-queries', () => ({
    useListCustomerIntegrationsWithChannelDefault: jest.fn(),
    useScheduleShopifyCreateNewCustomerAction: jest.fn(),
    useScheduleShopifyUpdateCustomerAction: jest.fn(),
}))

const activeCustomer = Map({
    id: 123,
    name: 'John Smith',
    email: 'john.smith@example.com',
})

const queryClient = mockQueryClient()
const state = {}

const createMockMutation = (overrides = {}) => ({
    mutate: jest.fn(),
    isLoading: false,
    isSuccess: false,
    isError: false,
    ...overrides,
})

const setupMockIntegrations = (hasCustomerData?: boolean) => {
    ;(
        useListCustomerIntegrationsWithChannelDefault as jest.Mock
    ).mockReturnValue({
        data: fromJS([
            {
                id: 1,
                name: 'store1',
                type: SHOPIFY_INTEGRATION_TYPE,
            },
            {
                id: 2,
                name: 'store2',
                type: SHOPIFY_INTEGRATION_TYPE,
                default: true,
                ...(hasCustomerData !== undefined && { hasCustomerData }),
            },
        ]),
    })
}

const renderCustomerSyncForm = (props = {}) => {
    const defaultProps = {
        activeCustomer,
        isCustomerSyncFormOpen: true,
        setIsCustomerSyncFormOpen: jest.fn(),
        ...props,
    }

    return render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>
                <CustomerSyncForm {...defaultProps} />
            </Provider>
        </QueryClientProvider>,
    )
}

const fillBasicForm = (includePhone = true) => {
    fireEvent.change(screen.getByLabelText('Email*'), {
        target: { value: 'john.smith@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Smith' },
    })

    if (includePhone) {
        const phoneInput = screen.getByLabelText('phone')
        fireEvent.change(phoneInput, {
            target: { value: '123-456-7890' },
        })
    }
}

const fillAddressForm = async (includeShippingPhone = true) => {
    await waitFor(() => {
        expect(screen.getByText('Add delivery address')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Add delivery address'))

    const countryElements = screen.getAllByText('🇺🇸')
    fireEvent.click(countryElements[1])

    await screen.findByText('Monaco')
    fireEvent.click(screen.getByText('Monaco'))

    await waitFor(() => {
        expect(screen.getByLabelText('Company')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Company'), {
        target: { value: 'Company' },
    })
    fireEvent.change(screen.getByLabelText('Address'), {
        target: { value: 'Address' },
    })
    fireEvent.change(screen.getByLabelText('Apartment, suite, etc'), {
        target: { value: 'Apartment 1' },
    })
    fireEvent.change(screen.getByLabelText('City'), {
        target: { value: 'City' },
    })
    fireEvent.change(screen.getByPlaceholderText('Type state or province...'), {
        target: { value: 'Monte Carlo' },
    })
    fireEvent.change(screen.getByLabelText('ZIP/Postal code'), {
        target: { value: '12345' },
    })

    if (includeShippingPhone) {
        const defaultAddressPhoneInput = screen.getByLabelText(
            'defaultAddressPhone',
        )
        fireEvent.change(defaultAddressPhoneInput, {
            target: { value: '987-654-3210' },
        })
    }
}

const getExpectedDataWithAddress = (
    includePhone = true,
    includeShippingPhone = true,
) => ({
    email: 'john.smith@example.com',
    first_name: 'John',
    last_name: 'Smith',
    phone: includePhone ? '+11234567890' : null,
    address: {
        address1: 'Address',
        address2: 'Apartment 1',
        company: 'Company',
        city: 'City',
        country_code: 'MC',
        zip: '12345',
        province_code: 'Monte Carlo',
        phone: includeShippingPhone ? '+19876543210' : null,
    },
})

const getExpectedDataWithoutAddress = (includePhone = true) => ({
    email: 'john.smith@example.com',
    first_name: 'John',
    last_name: 'Smith',
    phone: includePhone ? '+11234567890' : undefined,
    address: undefined,
})

describe('CustomerSyncForm', () => {
    const mockCreateShopifyCustomer = createMockMutation()
    const mockUpdateShopifyCustomer = createMockMutation()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(jest.fn())
        ;(
            useScheduleShopifyCreateNewCustomerAction as jest.Mock
        ).mockImplementation(() => mockCreateShopifyCustomer)
        ;(
            useScheduleShopifyUpdateCustomerAction as jest.Mock
        ).mockImplementation(() => mockUpdateShopifyCustomer)
        ;(
            useListCustomerIntegrationsWithChannelDefault as jest.Mock
        ).mockReturnValue({
            data: fromJS([]),
        })
    })

    it('renders the form correctly', () => {
        renderCustomerSyncForm()

        expect(
            screen.getByText('Sync John Smith profile to Shopify'),
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Email*')).toBeInTheDocument()
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
    })

    it('validates the form fields', () => {
        renderCustomerSyncForm({
            activeCustomer: Map({
                name: 'John Smith',
                email: '',
            }),
        })

        fireEvent.click(screen.getByText('Add delivery address'))
        fireEvent.click(screen.getByText('Sync Profile'))

        expect(
            screen.getByText(
                /Please enter a valid email address to sync this profile with Shopify/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Please select shopify store'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Please enter a street name and house number'),
        ).toBeInTheDocument()
        expect(screen.getByText('Please enter a city')).toBeInTheDocument()
        expect(screen.getByText('Please select a state')).toBeInTheDocument()
        expect(screen.getByText('Please enter a zip code')).toBeInTheDocument()
    })

    it.each([
        ['creating', false],
        ['updating', true],
    ])(
        'handles form submission when %s a customer with address',
        async (_, hasCustomerData) => {
            setupMockIntegrations(hasCustomerData)
            const setIsCustomerSyncFormOpen = jest.fn()

            renderCustomerSyncForm({ setIsCustomerSyncFormOpen })

            fillBasicForm()
            await fillAddressForm()
            fireEvent.click(screen.getByText('Sync Profile'))

            const expectedData = getExpectedDataWithAddress()
            const expectedCall = {
                integrationId: 2,
                data: expectedData,
                ...(hasCustomerData && { params: { customer_id: 123 } }),
            }

            await waitFor(() => {
                if (hasCustomerData) {
                    expect(
                        mockUpdateShopifyCustomer.mutate,
                    ).toHaveBeenCalledWith(expectedCall)
                } else {
                    expect(
                        mockCreateShopifyCustomer.mutate,
                    ).toHaveBeenCalledWith(expectedCall)
                }
            })
        },
    )

    it.each([
        ['creating', false],
        ['updating', true],
    ])(
        'handles form submission when %s a customer without address',
        async (_, hasCustomerData) => {
            setupMockIntegrations(hasCustomerData)

            renderCustomerSyncForm()

            fillBasicForm()
            fireEvent.click(screen.getByText('Sync Profile'))

            const expectedData = getExpectedDataWithoutAddress()
            const expectedCall = {
                integrationId: 2,
                data: expectedData,
                ...(hasCustomerData && { params: { customer_id: 123 } }),
            }

            if (hasCustomerData) {
                expect(mockUpdateShopifyCustomer.mutate).toHaveBeenCalledWith(
                    expectedCall,
                )
            } else {
                expect(mockCreateShopifyCustomer.mutate).toHaveBeenCalledWith(
                    expectedCall,
                )
            }
        },
    )

    it('dispatches error notification on create customer error', async () => {
        const mockCreateCustomerError = {
            status: 400,
            message: 'Custom error message',
        }

        ;(
            useScheduleShopifyCreateNewCustomerAction as jest.Mock
        ).mockReturnValue(
            createMockMutation({
                isError: true,
                error: mockCreateCustomerError,
            }),
        )

        renderCustomerSyncForm()

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                dismissAfter: 0,
                closeOnNext: true,
                message: 'Custom error message',
            })
        })
    })

    it('dispatches error notification on update customer error', async () => {
        const mockUpdateCustomerError = {
            status: 400,
            message: 'Custom error message',
        }

        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue(
            createMockMutation({
                isError: true,
                error: mockUpdateCustomerError,
            }),
        )

        renderCustomerSyncForm()

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                dismissAfter: 0,
                closeOnNext: true,
                message: 'Custom error message',
            })
        })
    })

    it('dispatches loading notification when create customer sync is in progress', async () => {
        ;(
            useScheduleShopifyCreateNewCustomerAction as jest.Mock
        ).mockReturnValue(createMockMutation({ isLoading: true }))
        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue(
            createMockMutation(),
        )

        renderCustomerSyncForm()

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith({
                status: NotificationStatus.Loading,
                dismissAfter: 0,
                closeOnNext: true,
                message: 'Syncing profile to Shopify...',
            })
        })
    })

    it('dispatches loading notification when update customer sync is in progress', async () => {
        ;(
            useScheduleShopifyCreateNewCustomerAction as jest.Mock
        ).mockReturnValue(createMockMutation())
        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue(
            createMockMutation({ isLoading: true }),
        )

        renderCustomerSyncForm()

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith({
                status: NotificationStatus.Loading,
                dismissAfter: 0,
                closeOnNext: true,
                message: 'Syncing profile to Shopify...',
            })
        })
    })

    it('closes form when the message success on create customer action', async () => {
        ;(
            useScheduleShopifyCreateNewCustomerAction as jest.Mock
        ).mockReturnValue(createMockMutation({ isSuccess: true }))
        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue(
            createMockMutation(),
        )

        const mockSetIsCustomerSyncFormOpen = jest.fn()
        renderCustomerSyncForm({
            setIsCustomerSyncFormOpen: mockSetIsCustomerSyncFormOpen,
        })

        expect(mockSetIsCustomerSyncFormOpen).toHaveBeenCalled()
    })

    it('closes form when the message success on update customer action', async () => {
        ;(
            useScheduleShopifyCreateNewCustomerAction as jest.Mock
        ).mockReturnValue(createMockMutation())
        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue(
            createMockMutation({ isSuccess: true }),
        )

        const mockSetIsCustomerSyncFormOpen = jest.fn()
        renderCustomerSyncForm({
            setIsCustomerSyncFormOpen: mockSetIsCustomerSyncFormOpen,
        })

        expect(mockSetIsCustomerSyncFormOpen).toHaveBeenCalled()
    })

    it.each([
        ['creating', false],
        ['updating', true],
    ])(
        'handles form submission with falsy defaultAddressPhone when %s a customer (value: %s)',
        async (_, hasCustomerData) => {
            const mutationMock = hasCustomerData
                ? mockUpdateShopifyCustomer
                : mockCreateShopifyCustomer
            setupMockIntegrations(hasCustomerData)

            renderCustomerSyncForm()

            fillBasicForm()
            await fillAddressForm(false)

            const defaultAddressPhoneInput = screen.getByLabelText(
                'defaultAddressPhone',
            )
            expect(defaultAddressPhoneInput).toHaveValue('')

            fireEvent.click(screen.getByText('Sync Profile'))

            const expectedData = getExpectedDataWithAddress(true, false)
            const expectedCall = {
                integrationId: 2,
                data: expectedData,
                ...(hasCustomerData && { params: { customer_id: 123 } }),
            }

            await waitFor(() => {
                if (hasCustomerData) {
                    expect(mutationMock.mutate).toHaveBeenCalledWith(
                        expectedCall,
                    )
                }
            })
        },
    )
})
