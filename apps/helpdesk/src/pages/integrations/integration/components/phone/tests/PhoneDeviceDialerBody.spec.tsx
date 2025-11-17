import type { ComponentProps } from 'react'
import React from 'react'

import { screen } from '@testing-library/react'

import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

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
        }) => (
            <div data-testid="mock-dialpad">
                <div
                    onClick={() => onChange(value + '1')}
                    data-testid="mock-dialpad-digit"
                />
            </div>
        ),
)

jest.mock('@gorgias/axiom', () => ({
    Skeleton: () => <div data-testid="skeleton" />,
}))

jest.mock('pages/common/components/Avatar/Avatar', () => () => (
    <div data-testid="avatar" />
))

const defaultProps = {
    value: '123',
    onChange: jest.fn(),
    results: [],
    isLoading: false,
    isSearchTypeCustomer: false,
    selectedCustomer: null,
    onCustomerSelect: jest.fn(),
    highlightedResultIndex: null,
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

    it('should render dialpad when search value is defined but search was not yet triggered', () => {
        const props = {
            ...defaultProps,
            isLoading: false,
            results: undefined,
            value: '1234',
        }
        renderComponent(props)
        expect(screen.getByTestId('mock-dialpad')).toBeInTheDocument()
    })

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
})
