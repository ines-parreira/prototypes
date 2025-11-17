import type { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import type { UserSearchResult } from 'models/search/types'

import PhoneSearchResultsContent from '../PhoneSearchResultsContent'

describe('PhoneSearchResultsContent', () => {
    const mockResults: UserSearchResult[] = [
        {
            id: '1',
            customer: { name: 'John Doe' },
            address: '123 Main St',
        },
        {
            id: '2',
            customer: { name: 'Jane Smith' },
            address: '456 Elm St',
        },
    ] as any

    const defaultProps: ComponentProps<typeof PhoneSearchResultsContent> = {
        results: mockResults,
        isLoading: false,
        isSearchTypeCustomer: true,
        onCustomerSelect: jest.fn(),
        highlightedResultIndex: null,
    }

    const renderComponent = (
        props: Partial<ComponentProps<typeof PhoneSearchResultsContent>> = {},
    ) => {
        return render(
            <PhoneSearchResultsContent {...defaultProps} {...props} />,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render loading skeletons when isLoading is true', () => {
        renderComponent({ isLoading: true })

        const skeletons = screen.getAllByLabelText('Loading')
        expect(skeletons).toHaveLength(4)
    })

    it('should render "No results" when isSearchTypeCustomer is true and results are empty', () => {
        renderComponent({
            isSearchTypeCustomer: true,
            results: [],
        })

        expect(screen.getByText('No results')).toBeInTheDocument()
    })

    it('should render "No results" when isSearchTypeCustomer is true and results are undefined', () => {
        renderComponent({
            isSearchTypeCustomer: true,
            results: undefined,
        })

        expect(screen.getByText('No results')).toBeInTheDocument()
    })

    it('should render results list with customer details when results are available', () => {
        renderComponent()

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('123 Main St')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('456 Elm St')).toBeInTheDocument()
    })

    it('should call onCustomerSelect when a customer is clicked', () => {
        const onCustomerSelect = jest.fn()
        renderComponent({ onCustomerSelect })

        fireEvent.click(screen.getByText('John Doe'))
        expect(onCustomerSelect).toHaveBeenCalledWith(mockResults[0])

        fireEvent.click(screen.getByText('Jane Smith'))
        expect(onCustomerSelect).toHaveBeenCalledWith(mockResults[1])
    })

    it('should render empty fragment when isSearchTypeCustomer is false and no results', () => {
        const { container } = renderComponent({
            isSearchTypeCustomer: false,
            results: [],
        })

        expect(container).toBeEmptyDOMElement()
    })

    it('should render empty fragment when isSearchTypeCustomer is false and results are undefined', () => {
        const { container } = renderComponent({
            isSearchTypeCustomer: false,
            results: undefined,
        })

        expect(container).toBeEmptyDOMElement()
    })

    it('should render results list even when isSearchTypeCustomer is false but results exist', () => {
        renderComponent({
            isSearchTypeCustomer: false,
            results: mockResults,
        })

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should not render results list when loading', () => {
        renderComponent({
            isLoading: true,
            results: mockResults,
        })

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
})
