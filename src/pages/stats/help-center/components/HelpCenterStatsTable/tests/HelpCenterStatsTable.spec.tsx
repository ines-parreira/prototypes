import React, {ComponentProps} from 'react'
import {act, fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import noop from 'lodash/noop'
import HelpCenterStatsTable, {TableCellType} from '../HelpCenterStatsTable'

const renderComponent = (
    props: Partial<ComponentProps<typeof HelpCenterStatsTable>>
) => {
    render(
        <HelpCenterStatsTable
            count={0}
            currentPage={1}
            data={[]}
            columns={[]}
            onPageChange={noop}
            {...props}
        />
    )
}

describe('HelpCenterStatsTable', () => {
    it('should render', () => {
        renderComponent({})

        expect(
            screen.getByTestId('help-center-stats-table')
        ).toBeInTheDocument()
    })

    it('should show loading state', () => {
        renderComponent({
            isLoading: true,
            columns: [{name: 'Article', type: TableCellType.String}],
        })
        expect(document.querySelector('.loader')).toBeInTheDocument()
    })

    it('should render columns with rows', () => {
        renderComponent({
            columns: [{name: 'Article', type: TableCellType.String}],
            data: [[{type: TableCellType.String, value: 'Orders & Shipping'}]],
        })

        expect(screen.getByText('Article')).toBeInTheDocument()
        expect(screen.getByText('Orders & Shipping')).toBeInTheDocument()
    })

    it('should render link when row have link props', () => {
        renderComponent({
            columns: [{name: 'Article', type: TableCellType.String}],
            data: [
                [
                    {
                        type: TableCellType.String,
                        value: 'Orders & Shipping',
                        link: '#',
                    },
                ],
            ],
        })

        expect(screen.getByRole('link')).toHaveTextContent('Orders & Shipping')
    })

    it('should render tooltip when column have tooltip props', () => {
        renderComponent({
            columns: [
                {
                    name: 'Article',
                    type: TableCellType.String,
                    tooltip: {title: 'Tooltip'},
                },
            ],
        })

        expect(document.querySelector('.tooltip')).toBeInTheDocument()
    })

    it('should add shadow and stickiness for the first column when user scroll', () => {
        renderComponent({
            columns: [
                {
                    name: 'Article',
                    type: TableCellType.String,
                },
            ],
            data: [
                [
                    {
                        type: TableCellType.String,
                        value: 'Orders & Shipping',
                        link: '#',
                    },
                ],
            ],
        })

        expect(document.querySelector('.withShadow')).not.toBeInTheDocument()

        act(() => {
            fireEvent.scroll(screen.getByTestId('help-center-stats-table'), {
                target: {scrollLeft: 500},
            })
        })

        expect(document.querySelector('.withShadow')).toBeInTheDocument()
    })

    it('should handle onClick when rows have onClick prop', () => {
        const mockOnClick = jest.fn()

        renderComponent({
            columns: [
                {
                    name: 'Article',
                    type: TableCellType.String,
                },
            ],
            data: [
                [
                    {
                        type: TableCellType.String,
                        value: 'Orders & Shipping',
                        onClick: mockOnClick,
                    },
                ],
            ],
        })

        expect(mockOnClick).toHaveBeenCalledTimes(0)

        userEvent.click(screen.getByText('Orders & Shipping'))

        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should have pagination when `count` more than data length', () => {
        renderComponent({
            count: 5,
            data: [
                [
                    {
                        type: TableCellType.String,
                        value: 'Orders & Shipping',
                    },
                ],
            ],
        })

        expect(
            screen.getByTestId('help-center-table-pagination')
        ).toBeInTheDocument()
    })

    it('should not have pagination when `count` less than data length', () => {
        renderComponent({
            count: 1,
            data: [
                [
                    {
                        type: TableCellType.String,
                        value: 'Orders & Shipping',
                    },
                ],
                [
                    {
                        type: TableCellType.String,
                        value: 'Report Issue',
                    },
                ],
            ],
        })

        expect(
            screen.queryByTestId('help-center-table-pagination')
        ).not.toBeInTheDocument()
    })
})
