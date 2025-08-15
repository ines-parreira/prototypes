import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import CustomerOptionsDropdownButton from '../CustomerOptionsDropdown'

const queryClient = mockQueryClient()
const state = {
    integrations: fromJS({
        integrations: [{ type: 'shopify' }],
    }),
}

describe('CustomerOptionsDropdownButton', () => {
    const activeCustomer = Map({ name: 'John Doe' })

    test('renders dropdown button', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerOptionsDropdownButton
                        activeCustomer={activeCustomer}
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(
            screen.getByTestId('test-customer-options-dropdown-button'),
        ).toBeInTheDocument()
    })

    test('opens dropdown on button click and then it closes it', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerOptionsDropdownButton
                        activeCustomer={activeCustomer}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText('Edit Customer')).toBeInTheDocument()
        expect(screen.getByText('Sync profile to Shopify')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button'))
        expect(screen.queryByText('Edit Customer')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Sync profile to Shopify'),
        ).not.toBeInTheDocument()
    })

    test('opens edit customer modal on dropdown item click and then it closes it', () => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerOptionsDropdownButton
                        activeCustomer={activeCustomer}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(screen.getByRole('button'))
        fireEvent.click(screen.getByText('Edit Customer'))

        expect(
            screen.getByText('Update customer: John Doe'),
        ).toBeInTheDocument()

        fireEvent.keyDown(container, { key: 'Escape' })
    })

    test('opens sync customer modal on dropdown item click', () => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CustomerOptionsDropdownButton
                        activeCustomer={activeCustomer}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(screen.getByRole('button'))
        fireEvent.click(screen.getByText('Sync profile to Shopify'))

        expect(
            screen.getByText('Sync John Doe profile to Shopify'),
        ).toBeInTheDocument()

        fireEvent.keyDown(container, { key: 'Escape' })
    })

    test('doesnt show sync options if there is no shopify integration at all', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider
                    store={mockStore({
                        integrations: fromJS({
                            integrations: [],
                        }),
                    })}
                >
                    <CustomerOptionsDropdownButton
                        activeCustomer={activeCustomer}
                    />
                </Provider>
                ,
            </QueryClientProvider>,
        )

        fireEvent.click(screen.getByRole('button'))
        expect(
            screen.queryByText('Sync profile to Shopify'),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByText('Sync John Doe profile to Shopify'),
        ).not.toBeInTheDocument()
    })
})
