import React, {ComponentProps, ReactElement} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map, List} from 'immutable'

import * as viewsConfig from '../../../../../config/views'
import * as ticketFixtures from '../../../../../fixtures/ticket'
import BlankState from '../../BlankState/index.js'
import {TableContainer} from '../Table'
import Row from '../Table/Row'

jest.mock('../../../../../state/views/actions', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _identity: <T>(arg: T) => T = require('lodash/identity')

    return {
        updateSelectedItemsIds: jest.fn(() => _identity),
        resetView: jest.fn(() => _identity),
    }
})

jest.mock(
    '../Table/Row',
    () => ({isSelected, selectable}: ComponentProps<typeof Row>) => (
        <div>
            Row:
            <div>selectable: {selectable?.toString()}</div>
            <div>isSelected: {isSelected?.toString()}</div>
        </div>
    )
)
jest.mock('../Table/HeaderCell', () => () => <div>HeaderCell</div>)
jest.mock(
    '../../BlankState/index.js',
    () => ({message}: ComponentProps<typeof BlankState>) => (
        <div>
            BlankState
            <div>{message}</div>
        </div>
    )
)

describe('ViewTable::Table', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>

    const minProps = {
        view: fromJS({}),
        type: viewConfig.get('name'),
        fields: (viewConfig.get('fields') as List<any>).take(3) as List<any>,
        config: viewsConfig.getConfigByName('ticket'),
        items: fromJS([ticketFixtures.ticket]),
        isSearch: false,
        isLoading: () => false,
        navigation: fromJS({hasPrevItems: false, hasNextItems: false}),
        fetchViewItems: jest.fn(),
        getItemUrl: () => '',
        onItemClick: () => undefined,
        ActionsComponent: null,
        selectedItemsIds: fromJS([]),
        viewSelected: false,
        toggleIdInPageSelection: jest.fn(),
        toggleViewSelection: jest.fn(),
        resetView: jest.fn(),
        updatePageSelection: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display a view with no fields', () => {
        const component = shallow(
            <TableContainer {...minProps} fields={fromJS([])} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display a default view', () => {
        const component = shallow(<TableContainer {...minProps} />)
        expect(component).toMatchSnapshot()
    })

    it('should display a default view with option selectable set to false', () => {
        const component = shallow(
            <TableContainer {...minProps} selectable={false} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display a default view with no items', () => {
        const component = shallow(
            <TableContainer {...minProps} items={fromJS([])} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display a modified view with no items, should reset the view and fetch first items ', () => {
        const component = shallow(
            <TableContainer
                {...minProps}
                items={fromJS([])}
                view={fromJS({dirty: true})}
            />
        )
        expect(component).toMatchSnapshot()

        const message = shallow(
            (component.find(BlankState).props() as {message: ReactElement})
                .message
        )
        message.find('a').simulate('click')
        expect(minProps.resetView).toBeCalled()
        expect(minProps.fetchViewItems).toBeCalledWith()
    })

    it(
        'should select all items on the current page of the active view when there is a click on the "select all"' +
            ' checkbox',
        () => {
            const component = shallow(<TableContainer {...minProps} />)
            const selectAllButton = component.find('thead').find('td').first()
            selectAllButton.simulate('click')
            expect(minProps.updatePageSelection).toBeCalledWith(
                fromJS([ticketFixtures.ticket.id])
            )
        }
    )

    it('should display all checkboxes as checked when all items are selected', () => {
        const component = shallow(
            <TableContainer
                {...minProps}
                selectedItemsIds={fromJS([ticketFixtures.ticket.id])}
            />
        )
        const selectAllButton = component.find('thead').find('td')
        expect(selectAllButton.find('input')).toBeChecked()
    })
})
