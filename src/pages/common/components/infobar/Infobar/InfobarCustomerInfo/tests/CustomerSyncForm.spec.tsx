import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom/extend-expect'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'

import { useListCustomerIntegrationsWithChannelDefault } from '@gorgias/api-queries'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import CustomerSyncForm from '../CustomerSyncForm/CustomerSyncForm'

jest.mock('@gorgias/api-queries', () => ({
    useListCustomerIntegrationsWithChannelDefault: jest
        .fn()
        .mockReturnValue({ data: [] }),
}))

const activeCustomer = Map({
    name: 'John Smith',
})

const queryClient = mockQueryClient()

const state = {}
describe('CustomerSyncForm', () => {
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
            screen.getByText('Sync customer John Smith with Shopify'),
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
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
                'Please enter a valid email address to sync this profile with Shopify. Syncing requires the customer’s email.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Please select shopify store.'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Please enter a street name and house number.'),
        ).toBeInTheDocument()
        expect(screen.getByText('Please enter a city.')).toBeInTheDocument()
        expect(screen.getByText('Please select a state.')).toBeInTheDocument()
        expect(screen.getByText('Please enter a zip code.')).toBeInTheDocument()
    })

    it('handles form submission', async () => {
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

        fireEvent.change(screen.getByLabelText('Email'), {
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
})
