import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useSearchCustomer} from 'models/aiAgent/queries'
import {CustomerSearchDropdownSelectView} from './CustomerSearchDropdownSelectView'

jest.mock('models/aiAgent/queries', () => ({
    useSearchCustomer: jest.fn(),
}))
const mockUseSearchCustomer = jest.mocked(useSearchCustomer)

const customer = {
    id: 0,
    address: 'test@example.com',
    user: {
        name: 'test',
        id: 0,
    },
}

describe('CustomerSearchDropdownSelectView', () => {
    beforeEach(() => {
        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: {data: []},
            },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchCustomer>)
    })

    it('renders without crashing', () => {
        render(
            <CustomerSearchDropdownSelectView
                className=""
                onSelect={jest.fn()}
                baseSearchTerm=""
                isDisabled={false}
            />
        )
        expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('initial state is correct', () => {
        render(
            <CustomerSearchDropdownSelectView
                className=""
                onSelect={jest.fn()}
                baseSearchTerm="test"
                isDisabled={false}
            />
        )
        expect(screen.getByRole('textbox')).toHaveValue('test')
    })

    it('search functionality works', async () => {
        const refetchMock = jest.fn()
        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: {data: [customer]},
            },
            refetch: refetchMock,
        } as unknown as ReturnType<typeof useSearchCustomer>)

        render(
            <CustomerSearchDropdownSelectView
                className=""
                onSelect={jest.fn()}
                baseSearchTerm=""
                isDisabled={false}
            />
        )
        const input = screen.getByRole('textbox')
        await userEvent.type(input, 'test@example.com')

        await waitFor(() => expect(refetchMock).toHaveBeenCalled())
    })

    it('dropdown visibility based on state', async () => {
        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: {data: [customer]},
            },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchCustomer>)

        render(
            <CustomerSearchDropdownSelectView
                className=""
                onSelect={jest.fn()}
                baseSearchTerm=""
                isDisabled={false}
            />
        )
        const input = screen.getByRole('textbox')
        await userEvent.type(input, 'test@example.com')

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument()
        })
    })

    it('selection functionality works', async () => {
        const onSelectMock = jest.fn()
        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: {data: [customer]},
            },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchCustomer>)

        render(
            <CustomerSearchDropdownSelectView
                className=""
                onSelect={onSelectMock}
                baseSearchTerm=""
                isDisabled={false}
            />
        )
        const input = screen.getByRole('textbox')
        await userEvent.type(input, 'test@example.com')

        const option = await screen.findByText('test@example.com')
        userEvent.click(option)

        await waitFor(() =>
            expect(onSelectMock).toHaveBeenCalledWith({
                email: customer.address,
                name: customer.user.name,
                id: customer.user.id,
            })
        )
    })
})
