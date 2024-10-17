import React, {ComponentProps} from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {tags} from 'fixtures/tag'

import Row from '../Row'
import Table from '../Table'

const mockStore = configureMockStore()

jest.mock(
    'pages/settings/tags/Row',
    () =>
        ({meta, row, refresh}: ComponentProps<typeof Row>) => (
            <div>
                RowMock
                <div onClick={refresh}>{row.name}</div>
                <div>{JSON.stringify(meta.toJS())}</div>
            </div>
        )
)

jest.mock('pages/settings/tags/TableActions/TableActions', () => () => (
    <div>TableActionsMock</div>
))

describe('<Table />', () => {
    const minProps: Omit<ComponentProps<typeof Table>, 'columns'> = {
        onBulkDelete: jest.fn(),
        onMerge: jest.fn(),
        onSelectAll: jest.fn(),
        onSort: jest.fn(),
        refresh: jest.fn(),
        reverse: true,
        selectedTagsIds: fromJS([1, 2]),
        sort: 'name',
        tags,
    }

    it('should display the tag table', () => {
        render(
            <Provider store={mockStore()}>
                <Table {...minProps} />
            </Provider>
        )

        expect(
            screen.getByRole('checkbox', {name: 'select-all'})
        ).not.toBeChecked()
        expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
        expect(screen.getAllByText('RowMock')).toHaveLength(4)
    })

    it('should sort by provided field', () => {
        render(
            <Provider store={mockStore()}>
                <Table {...minProps} sort="name" reverse={false} />
            </Provider>
        )

        fireEvent.click(screen.getByText(/Tag/i))
        expect(minProps.onSort).toHaveBeenNthCalledWith(1, 'name', true)
    })

    it('should display all tags of the page as selected', () => {
        render(
            <Provider
                store={mockStore({
                    tags: fromJS({
                        _internal: {
                            selectAll: true,
                        },
                    }),
                })}
            >
                <Table {...minProps} />
            </Provider>
        )

        const checkbox = screen.getByRole('checkbox', {name: 'select-all'})
        expect(checkbox).toBeChecked()
        fireEvent.click(checkbox)
        expect(minProps.onSelectAll).toHaveBeenCalledWith()
    })

    it('should order the table when clicking on the usage header cell', () => {
        render(
            <Provider store={mockStore()}>
                <Table {...minProps} />
            </Provider>
        )

        fireEvent.click(screen.getByText(/Tickets/i))
        expect(minProps.onSort).toHaveBeenCalledWith('usage', false)
    })

    it('should not order the table when clicking on the description header cell', () => {
        render(
            <Provider store={mockStore()}>
                <Table {...minProps} />
            </Provider>
        )

        fireEvent.click(screen.getByText(/Description/i))
        expect(minProps.onSort).not.toHaveBeenCalled()
    })

    it('should trigger refresh from Row', () => {
        render(
            <Provider store={mockStore()}>
                <Table {...minProps} />
            </Provider>
        )

        fireEvent.click(screen.getByText(/refund accepted/i))
        expect(minProps.refresh).toHaveBeenCalled()
    })

    it('should trigger refresh from Row when it is the only tag from the page', () => {
        render(
            <Provider store={mockStore()}>
                <Table {...minProps} tags={[tags[0]]} />
            </Provider>
        )

        fireEvent.click(screen.getByText(/billing/i))
        expect(minProps.refresh).toHaveBeenCalledWith({
            refreshPreviousPage: true,
        })
    })

    it('should display warning banner when selected tags are outside of the viewed page', () => {
        render(
            <Provider store={mockStore()}>
                <Table {...minProps} selectedTagsIds={fromJS([88, 99])} />
            </Provider>
        )

        expect(screen.getByText(/You have/).textContent).toBe(
            'warningYou have 2 tags selected across different pages. Undo selection'
        )
        fireEvent.click(screen.getByText(/Undo selection/))
        expect(minProps.onSelectAll).toHaveBeenCalledWith(false)
    })
})
