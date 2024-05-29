import {fireEvent, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import PhoneDeviceDialerBody from '../PhoneDeviceDialerBody'

jest.mock(
    'pages/integrations/integration/components/phone/DialPad',
    () =>
        ({
            onChange,
            value,
        }: {
            onChange: (value: string) => void
            value: string
        }) =>
            (
                <div data-testid="mock-dialpad">
                    <div
                        onClick={() => onChange(value + '1')}
                        data-testid="mock-dialpad-digit"
                    />
                </div>
            )
)

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid="skeleton" />
))

const defaultProps = {
    value: '123',
    onChange: jest.fn(),
    results: [],
    isLoading: false,
    isSearchTypeCustomer: false,
    selectedCustomer: null,
    onCustomerSelect: jest.fn(),
}

const renderComponent = (props: ComponentProps<typeof PhoneDeviceDialerBody>) =>
    renderWithQueryClientProvider(<PhoneDeviceDialerBody {...props} />)

describe('PhoneDeviceDialerBody', () => {
    it('should render dialpad when customer is selected', () => {
        const props = {
            ...defaultProps,
            selectedCustomer: {
                id: 1,
            } as any,
        }
        renderComponent(props)
        expect(screen.getByTestId('mock-dialpad')).toBeInTheDocument()
    })

    it('should render dialpad when phone number search is selected and there are no results', () => {
        const props = {
            ...defaultProps,
            isSearchTypeCustomer: false,
        }
        renderComponent(props)
        expect(screen.getByTestId('mock-dialpad')).toBeInTheDocument()
    })

    it.each(['', '1', '12'])(
        'should render dialpad when search value is shorter than 3 characters',
        (value) => {
            const props = {
                ...defaultProps,
                value,
            }
            renderComponent(props)
            expect(screen.getByTestId('mock-dialpad')).toBeInTheDocument()
        }
    )

    it('should render skeleton when loading', () => {
        const props = {
            ...defaultProps,
            isLoading: true,
        }
        renderComponent(props)
        expect(screen.getAllByTestId('skeleton')).toHaveLength(4)
    })

    it('should render no results when search value is not null and no results are found', () => {
        const props = {
            ...defaultProps,
            isSearchTypeCustomer: true,
        }
        renderComponent(props)
        expect(screen.getByText('No results')).toBeInTheDocument()
    })

    it('should render results when results are found', () => {
        const customer = {
            id: 1,
            customer: {
                name: 'John Doe',
            },
            address: '+123',
        }
        const props = {
            ...defaultProps,
            results: [customer] as any[],
        }
        renderComponent(props)
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('+123')).toBeInTheDocument()

        fireEvent.click(screen.getByText('John Doe'))
        expect(props.onCustomerSelect).toHaveBeenCalledWith(customer)
    })
})
