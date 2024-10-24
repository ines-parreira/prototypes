import {fireEvent, render, screen, within} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import {UserSearchResult} from 'models/search/types'

import PhoneDeviceDialerBodyResultsList from '../PhoneDeviceDialerBodyResultsList'

jest.mock('pages/common/components/Avatar/Avatar', () => () => (
    <div data-testid="avatar" />
))

describe('PhoneDeviceDialerBodyResultsList', () => {
    const mockResults: UserSearchResult[] = [
        {
            id: '1',
            customer: {name: 'John Doe'},
            address: '123 Main St',
        },
        {
            id: '2',
            customer: {name: 'Jane Smith'},
            address: '456 Elm St',
        },
    ] as any
    const defaultProps: ComponentProps<
        typeof PhoneDeviceDialerBodyResultsList
    > = {
        results: mockResults,
        onCustomerSelect: jest.fn(),
        highlightedResultIndex: null,
    }

    const renderComponent = (props = defaultProps) => {
        return render(<PhoneDeviceDialerBodyResultsList {...props} />)
    }

    it('should render results and select customer on click', () => {
        renderComponent()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()

        fireEvent.click(screen.getByText('John Doe'))
        expect(defaultProps.onCustomerSelect).toHaveBeenCalledWith(
            defaultProps.results[0]
        )
    })

    it('should highlight result', () => {
        const props = {
            ...defaultProps,
            highlightedResultIndex: 1,
        }
        const renderResult = renderComponent(props)
        const highlightedResult = renderResult.container.querySelector(
            '.highlighted'
        ) as HTMLElement

        expect(
            within(highlightedResult).getByText('Jane Smith')
        ).toBeInTheDocument()
    })
})
