import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { useSearchCustomer } from 'models/aiAgent/queries'

import { CustomerSearchDropdownSelectView } from './CustomerSearchDropdownSelectView'

jest.mock('models/aiAgent/queries', () => ({
    useSearchCustomer: jest.fn(),
}))
const mockUseSearchCustomer = jest.mocked(useSearchCustomer)
const CUSTOMER_SEARCH_DEBOUNCE_MS = 1000

const customer = {
    id: 0,
    address: 'test@example.com',
    user: {
        name: 'test',
        id: 0,
    },
}

const userWithFakeTimers = () =>
    userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

const advanceCustomerSearchDebounce = async () => {
    await act(async () => {
        jest.advanceTimersByTime(CUSTOMER_SEARCH_DEBOUNCE_MS)
    })
}

describe('CustomerSearchDropdownSelectView', () => {
    beforeEach(() => {
        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: undefined,
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchCustomer>)
    })

    afterEach(() => {
        jest.useRealTimers()
        jest.clearAllMocks()
    })

    it('renders without crashing', () => {
        render(
            <CustomerSearchDropdownSelectView
                className=""
                onSelect={jest.fn()}
                baseSearchTerm=""
                isDisabled={false}
            />,
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
            />,
        )
        expect(screen.getByRole('textbox')).toHaveValue('test')
    })

    it('search functionality works', async () => {
        jest.useFakeTimers()
        const user = userWithFakeTimers()
        const refetchMock = jest.fn()
        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: undefined,
            refetch: refetchMock,
        } as unknown as ReturnType<typeof useSearchCustomer>)

        render(
            <CustomerSearchDropdownSelectView
                className=""
                onSelect={jest.fn()}
                baseSearchTerm=""
                isDisabled={false}
            />,
        )
        const input = screen.getByRole('textbox')

        await act(async () => {
            await user.type(input, 'test@example.com')
        })
        await advanceCustomerSearchDebounce()

        expect(refetchMock).toHaveBeenCalled()
    })

    it('dropdown visibility based on state', async () => {
        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: { data: [customer] },
            },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchCustomer>)

        render(
            <CustomerSearchDropdownSelectView
                className=""
                onSelect={jest.fn()}
                baseSearchTerm=""
                isDisabled={false}
            />,
        )
        const input = screen.getByRole('textbox')

        await act(async () => {
            await userEvent.type(input, 'test@example.com')
        })

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument()
        })
    })

    it('selection functionality works', async () => {
        jest.useFakeTimers()
        const user = userWithFakeTimers()
        const onSelectMock = jest.fn()
        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: { data: [customer] },
            },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchCustomer>)

        render(
            <CustomerSearchDropdownSelectView
                className=""
                onSelect={onSelectMock}
                baseSearchTerm=""
                isDisabled={false}
            />,
        )
        const input = screen.getByRole('textbox')

        await act(async () => {
            await user.type(input, 'test@example.com')
        })
        await advanceCustomerSearchDebounce()

        const option = screen.getByText('test@example.com')

        await act(async () => {
            await user.click(option)
        })

        expect(onSelectMock).toHaveBeenCalledWith({
            email: customer.address,
            name: customer.user.name,
            id: customer.user.id,
        })
    })
})
