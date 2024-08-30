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
        ({meta, row, refresh}: ComponentProps<typeof Row>) =>
            (
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

        expect(screen.getByRole('checkbox', {name: 'select-all'})).toBeChecked()
    })

    it('should order the table when clicking on the usage header cell', () => {
        const {getByText} = render(
            <Provider store={mockStore()}>
                <Table {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/Tickets/i))
        expect(minProps.onSort).toHaveBeenNthCalledWith(1, 'usage', false)
    })

    it('should not order the table when clicking on the description header cell', () => {
        const {getByText} = render(
            <Provider store={mockStore()}>
                <Table {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/Description/i))
        expect(minProps.onSort).not.toHaveBeenCalled()
    })

    it('should trigger refresh from Row', () => {
        const {getByText} = render(
            <Provider store={mockStore()}>
                <Table {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/refund accepted/i))
        expect(minProps.refresh).toHaveBeenCalled()
    })

    it('should trigger refresh from Row when it is the only tag from the page', () => {
        const {getByText} = render(
            <Provider store={mockStore()}>
                <Table {...minProps} tags={[tags[0]]} />
            </Provider>
        )

        fireEvent.click(getByText(/billing/i))
        expect(minProps.refresh).toHaveBeenCalledWith({
            refreshPreviousPage: true,
        })
    })
})
