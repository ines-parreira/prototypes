import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom/extend-expect'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'

import {
    useListCustomerIntegrationsWithChannelDefault,
    useScheduleShopifyCreateNewCustomerAction,
    useScheduleShopifyUpdateCustomerAction,
} from '@gorgias/api-queries'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, mockStore } from 'utils/testing'

import CustomerSyncForm from '../CustomerSyncForm/CustomerSyncForm'

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions')
const mockNotify = assumeMock(notify)

jest.mock('@gorgias/api-queries', () => ({
    ...jest.requireActual('@gorgias/api-queries'),
    useListCustomerIntegrationsWithChannelDefault: jest
        .fn()
        .mockReturnValue({ data: [] }),
}))

const activeCustomer = Map({
    name: 'John Smith',
})

jest.mock('@gorgias/api-queries', () => ({
    useListCustomerIntegrationsWithChannelDefault: jest.fn(),
    useScheduleShopifyCreateNewCustomerAction: jest.fn(),
    useScheduleShopifyUpdateCustomerAction: jest.fn(),
}))

const queryClient = mockQueryClient()

const state = {}
describe('CustomerSyncForm', () => {
    beforeEach(() => {
        mockUseAppDispatch.mockReturnValue(jest.fn())
    })
    const mockCreateShopifyCustomer = {
        mutate: jest.fn(),
        isLoading: false,
        isSuccess: false,
        isError: false,
    }

    const mockUpdateShopifyCustomer = {
        mutate: jest.fn(),
        isLoading: false,
        isSuccess: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
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
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={jest.fn()}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(
            screen.getByText('Sync John Smith profile to Shopify'),
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Email*')).toBeInTheDocument()
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
    })

    it('validates the form fields', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={jest.fn()}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(screen.getByText('Add delivery address'))
        fireEvent.click(screen.getByText('Sync Profile'))

        expect(
            screen.getByText(
                'Please enter a valid email address to sync this profile with Shopify. Syncing requires the customer’s email',
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

    it('handles form submission when creating a customer with address', async () => {
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
                },
            ]),
        })

        const setIsCustomerSyncFormOpen = jest.fn()
        const spyUseCustomerSyncForm = jest.spyOn(
            require('../CustomerSyncForm/useCustomerSyncForm'),
            'useCustomerSyncForm',
        )

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={setIsCustomerSyncFormOpen}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.change(screen.getByLabelText('Email*'), {
            target: { value: 'john.smith@example.com' },
        })
        fireEvent.change(screen.getByLabelText('Name'), {
            target: { value: 'John Smith' },
        })

        const phoneInput = screen.getByPlaceholderText('000-000-0000')
        fireEvent.change(phoneInput, {
            target: { value: '123-456-7890' },
        })

        fireEvent.click(screen.getByText('Add delivery address'))

        const countryElements = screen.getAllByText('🇺🇸')
        fireEvent.click(countryElements[countryElements.length - 1])
        fireEvent.click(screen.getByText('Canada'))

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

        const stateLabel = screen.getByText('State')
        const container = stateLabel.closest('div')
        const stateInput = container?.querySelector('[role="combobox"]')

        userEvent.click(stateInput!)
        await waitFor(() => {
            expect(screen.getByText('Alberta')).toBeInTheDocument()
            fireEvent.click(screen.getByText('Alberta'))
        })

        fireEvent.change(screen.getByLabelText('ZIP/Postal code'), {
            target: { value: '12345' },
        })
        fireEvent.click(screen.getByText('Sync Profile'))

        expect(spyUseCustomerSyncForm).toHaveReturnedWith(
            expect.objectContaining({
                formState: expect.objectContaining({
                    store: 2,
                    email: 'john.smith@example.com',
                    name: 'John Smith',
                    phone: '+11234567890',
                    country: 'Canada',
                    countryCode: 'CA',
                    company: 'Company',
                    address: 'Address',
                    apartment: 'Apartment 1',
                    city: 'City',
                    stateOrProvince: 'Alberta',
                    postalCode: '12345',
                    deliveryAddressChecked: true,
                }),
            }),
        )
    })

    it('handles form submission when creating a customer without address', async () => {
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
                },
            ]),
        })

        const setIsCustomerSyncFormOpen = jest.fn()
        const spyUseCustomerSyncForm = jest.spyOn(
            require('../CustomerSyncForm/useCustomerSyncForm'),
            'useCustomerSyncForm',
        )

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={setIsCustomerSyncFormOpen}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.change(screen.getByLabelText('Email*'), {
            target: { value: 'john.smith@example.com' },
        })
        fireEvent.change(screen.getByLabelText('Name'), {
            target: { value: 'John Smith' },
        })

        const phoneInput = screen.getByPlaceholderText('000-000-0000')
        fireEvent.change(phoneInput, {
            target: { value: '123-456-7890' },
        })

        fireEvent.click(screen.getByText('Sync Profile'))

        expect(spyUseCustomerSyncForm).toHaveReturnedWith(
            expect.objectContaining({
                formState: expect.objectContaining({
                    store: 2,
                    email: 'john.smith@example.com',
                    name: 'John Smith',
                    phone: '+11234567890',
                    deliveryAddressChecked: false,
                }),
            }),
        )
    })

    it('handles form submission when updating a customer with address', async () => {
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
                    hasCustomerData: true,
                },
            ]),
        })

        const setIsCustomerSyncFormOpen = jest.fn()
        const spyUseCustomerSyncForm = jest.spyOn(
            require('../CustomerSyncForm/useCustomerSyncForm'),
            'useCustomerSyncForm',
        )

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={setIsCustomerSyncFormOpen}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.change(screen.getByLabelText('Email*'), {
            target: { value: 'john.smith@example.com' },
        })
        fireEvent.change(screen.getByLabelText('Name'), {
            target: { value: 'John Smith' },
        })

        const phoneInput = screen.getByPlaceholderText('000-000-0000')
        fireEvent.change(phoneInput, {
            target: { value: '123-456-7890' },
        })

        fireEvent.click(screen.getByText('Add delivery address'))

        const countryElements = screen.getAllByText('🇺🇸')
        fireEvent.click(countryElements[countryElements.length - 1])
        fireEvent.click(screen.getByText('Canada'))

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

        const stateLabel = screen.getByText('State')
        const container = stateLabel.closest('div')
        const stateInput = container?.querySelector('[role="combobox"]')

        userEvent.click(stateInput!)
        await waitFor(() => {
            expect(screen.getByText('Alberta')).toBeInTheDocument()
            fireEvent.click(screen.getByText('Alberta'))
        })

        fireEvent.change(screen.getByLabelText('ZIP/Postal code'), {
            target: { value: '12345' },
        })
        fireEvent.click(screen.getByText('Sync Profile'))

        expect(spyUseCustomerSyncForm).toHaveReturnedWith(
            expect.objectContaining({
                formState: expect.objectContaining({
                    store: 2,
                    email: 'john.smith@example.com',
                    name: 'John Smith',
                    phone: '+11234567890',
                    country: 'Canada',
                    countryCode: 'CA',
                    company: 'Company',
                    address: 'Address',
                    apartment: 'Apartment 1',
                    city: 'City',
                    stateOrProvince: 'Alberta',
                    postalCode: '12345',
                    deliveryAddressChecked: true,
                }),
            }),
        )
    })

    it('handles form submission when updating a customer without address', async () => {
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
                    hasCustomerData: true,
                },
            ]),
        })

        const setIsCustomerSyncFormOpen = jest.fn()
        const spyUseCustomerSyncForm = jest.spyOn(
            require('../CustomerSyncForm/useCustomerSyncForm'),
            'useCustomerSyncForm',
        )

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={setIsCustomerSyncFormOpen}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.change(screen.getByLabelText('Email*'), {
            target: { value: 'john.smith@example.com' },
        })
        fireEvent.change(screen.getByLabelText('Name'), {
            target: { value: 'John Smith' },
        })

        const phoneInput = screen.getByPlaceholderText('000-000-0000')
        fireEvent.change(phoneInput, {
            target: { value: '123-456-7890' },
        })

        fireEvent.click(screen.getByText('Sync Profile'))

        expect(spyUseCustomerSyncForm).toHaveReturnedWith(
            expect.objectContaining({
                formState: expect.objectContaining({
                    store: 2,
                    email: 'john.smith@example.com',
                    name: 'John Smith',
                    phone: '+11234567890',
                    deliveryAddressChecked: false,
                }),
            }),
        )
    })

    it('dispatches error notification on create customer error', async () => {
        const mockCreateCustomerError = {
            status: 400,
            message: 'Custom error message',
        }

        ;(
            useScheduleShopifyCreateNewCustomerAction as jest.Mock
        ).mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
            isError: true,
            error: mockCreateCustomerError,
        })

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={jest.fn()}
                    />
                </Provider>
            </QueryClientProvider>,
        )

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

        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
            isError: true,
            error: mockUpdateCustomerError,
        })

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={jest.fn()}
                    />
                </Provider>
            </QueryClientProvider>,
        )

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
        ).mockReturnValue({
            mutate: jest.fn(),
            isLoading: true,
            isSuccess: false,
            isError: false,
        })
        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
            isError: false,
        })

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={jest.fn()}
                    />
                </Provider>
            </QueryClientProvider>,
        )

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
        ).mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
            isError: false,
        })
        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue({
            mutate: jest.fn(),
            isLoading: true,
            isSuccess: false,
            isError: false,
        })

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={jest.fn()}
                    />
                </Provider>
            </QueryClientProvider>,
        )

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
        ).mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: true,
            isError: false,
        })
        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
            isError: false,
        })

        const mockSetIsCustomerSyncFormOpen = jest.fn()

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={
                            mockSetIsCustomerSyncFormOpen
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(mockSetIsCustomerSyncFormOpen).toHaveBeenCalled()
    })

    it('closes form when the message success on update customer action', async () => {
        ;(
            useScheduleShopifyCreateNewCustomerAction as jest.Mock
        ).mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
            isError: false,
        })
        ;(useScheduleShopifyUpdateCustomerAction as jest.Mock).mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: true,
            isError: false,
        })

        const mockSetIsCustomerSyncFormOpen = jest.fn()

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerSyncForm
                        activeCustomer={activeCustomer}
                        isCustomerSyncFormOpen={true}
                        setIsCustomerSyncFormOpen={
                            mockSetIsCustomerSyncFormOpen
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(mockSetIsCustomerSyncFormOpen).toHaveBeenCalled()
    })
})
