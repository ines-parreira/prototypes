import React, {ComponentProps, ComponentType, ReactElement} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map, List} from 'immutable'
import {Store} from 'redux'

import BlankState from '../../BlankState/index.js'
import untypedConfigureStore from '../../../../../store/configureStore.js'
import * as viewsConfig from '../../../../../config/views'
import * as viewsFixtures from '../../../../../fixtures/views.js'
import * as ticketFixtures from '../../../../../fixtures/ticket'
import * as viewsActions from '../../../../../state/views/actions'
import Table from '../Table'
import {RootState} from '../../../../../state/types'

// $TsFixMe: Remove on store/configureStore migration
const configureStore = (untypedConfigureStore as unknown) as (
    store: Partial<RootState>
) => Store<RootState>

jest.mock('../../../../../state/views/actions', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _identity: <T>(arg: T) => T = require('lodash/identity')

    return {
        updateSelectedItemsIds: jest.fn(() => _identity),
        resetView: jest.fn(() => _identity),
    }
})

const TableMock = (Table as unknown) as ComponentType<
    ComponentProps<typeof Table> & {store?: any}
>

describe('ViewTable::Table', () => {
    const minStore = {
        views: fromJS({
            active: viewsFixtures.view,
        }) as Map<any, any>,
    }

    const viewConfig = viewsConfig.views.first() as Map<any, any>

    const minProps = {
        view: fromJS({}),
        type: viewConfig.get('name'),
        fields: (viewConfig.get('fields') as List<any>).take(3) as List<any>,
        config: viewsConfig.getConfigByName('ticket'),
        items: fromJS([ticketFixtures.ticket]),
        isSearch: false,
        store: configureStore(minStore),
        isLoading: () => false,
        navigation: fromJS({hasPrevItems: false, hasNextItems: false}),
        fetchViewItems: jest.fn(),
        getItemUrl: () => '',
        onItemClick: () => undefined,
        ActionsComponent: null,
        selectedItemsIds: fromJS([]),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display a view with no fields', () => {
        const component = shallow(
            <TableMock {...minProps} fields={fromJS([])} />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('should display a default view', () => {
        const component = shallow(<TableMock {...minProps} />).dive()
        expect(component).toMatchSnapshot()
    })

    it('should display a default view with option selectable set to false', () => {
        const component = shallow(
            <TableMock {...minProps} selectable={false} />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('should display a default view with no items', () => {
        const component = shallow(
            <TableMock {...minProps} items={fromJS([])} />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('should display a modified view with no items, should reset the view and fetch first items ', () => {
        const component = shallow(
            <TableMock
                {...minProps}
                items={fromJS([])}
                view={fromJS({dirty: true})}
            />
        ).dive()
        expect(component).toMatchSnapshot()

        const message = shallow(
            (component.find(BlankState).props() as {message: ReactElement})
                .message
        )
        message.find('a').simulate('click')
        expect(viewsActions.resetView).toBeCalled()
        expect(minProps.fetchViewItems).toBeCalledWith()
    })

    it(
        'should select all items on the current page of the active view when there is a click on the "select all"' +
            ' checkbox',
        () => {
            const component = shallow(<TableMock {...minProps} />).dive()
            const selectAllButton = component.find('thead').find('td').first()
            selectAllButton.simulate('click')
            expect(viewsActions.updateSelectedItemsIds).toBeCalledWith(
                fromJS([ticketFixtures.ticket.id])
            )
        }
    )

    it('should display all checkboxes as checked when all items are selected', () => {
        const component = shallow(
            <TableMock
                {...minProps}
                selectedItemsIds={fromJS([ticketFixtures.ticket.id])}
                store={configureStore({
                    ...minStore,
                })}
            />
        ).dive()
        const selectAllButton = component.find('thead').find('td')
        expect(selectAllButton.find('input')).toBeChecked()
    })
})
