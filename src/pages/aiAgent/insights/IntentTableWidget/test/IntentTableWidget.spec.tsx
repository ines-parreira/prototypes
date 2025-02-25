import React from 'react'

import { render, screen } from '@testing-library/react'

import { IntentTableWithDefaultState } from '../IntentTable'
import { IntentTableWidget } from '../IntentTableWidget'

jest.mock('../IntentTable', () => ({
    IntentTableWithDefaultState: jest.fn(() => (
        <div>IntentTableWithDefaultState</div>
    )),
}))

describe('IntentTableWidget Component', () => {
    const defaultProps = {
        title: 'Widget Title',
        description: 'This is the widget description.',
        tableTitle: 'Table Title',
        tableHint: {
            title: 'Table Hint',
            link: 'https://example.com',
            linkText: 'Learn more',
        },
    }

    test('renders title and description correctly', () => {
        render(<IntentTableWidget {...defaultProps} />)

        expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
        expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
    })

    test('renders the IntentTableWithDefaultState component with correct props', () => {
        render(<IntentTableWidget {...defaultProps} />)

        const intentTable = screen.getByText('IntentTableWithDefaultState')
        expect(intentTable).toBeInTheDocument()

        expect(IntentTableWithDefaultState).toHaveBeenCalledWith(
            {
                tableTitle: defaultProps.tableTitle,
                tableHint: defaultProps.tableHint,
            },
            {},
        )
    })

    test('handles missing optional props gracefully', () => {
        const propsWithoutHint = {
            title: 'Widget Title',
            description: 'Description without a hint.',
            tableTitle: 'Table Title',
        }

        render(<IntentTableWidget {...propsWithoutHint} />)

        expect(screen.getByText(propsWithoutHint.title)).toBeInTheDocument()
        expect(
            screen.getByText(propsWithoutHint.description),
        ).toBeInTheDocument()

        const intentTable = screen.getByText('IntentTableWithDefaultState')
        expect(intentTable).toBeInTheDocument()

        expect(IntentTableWithDefaultState).toHaveBeenCalledWith(
            {
                tableTitle: propsWithoutHint.tableTitle,
                tableHint: undefined,
            },
            {},
        )
    })

    test('applies the correct CSS classes', () => {
        render(<IntentTableWidget {...defaultProps} />)

        const title = screen.getByText(defaultProps.title)
        const description = screen.getByText(defaultProps.description)

        expect(title).toHaveClass('title')
        expect(description).toHaveClass('description')
    })
})
