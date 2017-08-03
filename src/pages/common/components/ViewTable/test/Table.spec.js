import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import BlankState from '../../BlankState'
import configureStore from '../../../../../store/configureStore'
import * as viewsConfig from '../../../../../config/views'
import * as viewsFixtures from '../../../../../fixtures/views'
import * as ticketFixtures from '../../../../../fixtures/ticket'
import * as viewsActions from '../../../../../state/views/actions'
import Table from '../Table'

jest.mock('../../../../../state/views/actions', () => {
    const _noop = require('lodash/noop')

    return {
        fetchPage: jest.fn(() => _noop),
        toggleSelection: jest.fn(() => _noop),
        resetView: jest.fn(() => _noop),
    }
})

describe('ViewTable::Table', () => {
    const fixtureView = viewsFixtures.view

    const minStore = {
        views: fromJS({
            active: fixtureView,
        })
    }

    const viewConfig = viewsConfig.views.first()

    const minProps = {
        type: viewConfig.get('name'),
        items: fromJS([ticketFixtures.ticket]),
        fields: viewConfig.get('fields').take(3),
        isSearch: false,
        store: configureStore(minStore),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('empty view', () => {
        const component = shallow(
            <Table
                {...minProps}
                store={configureStore({
                    ...minStore,
                    views: fromJS({}),
                })}
                fields={fromJS([])}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('default view', () => {
        const component = shallow(<Table {...minProps} />).dive()
        expect(component).toMatchSnapshot()
    })

    it('default view with no items', () => {
        const component = shallow(<Table {...minProps} items={fromJS([])} />).dive()
        expect(component).toMatchSnapshot()
    })

    it('modified view with no items', () => {
        const component = shallow(
            <Table
                {...minProps}
                items={fromJS([])}
                store={configureStore({
                    ...minStore,
                    views: minStore.views.merge({
                        active: {
                            dirty: true,
                        }
                    })
                })}
            />
        ).dive()
        expect(component).toMatchSnapshot()

        const message = shallow(component.find(BlankState).props().message)
        message.find('a').simulate('click')
        expect(viewsActions.resetView).toBeCalled()
        expect(viewsActions.fetchPage).toBeCalledWith(1)
    })

    it('selects all items on click on select all checkbox', () => {
        const component = shallow(<Table {...minProps} />).dive()
        const selectAllButton = component.find('thead').find('td').first()
        selectAllButton.simulate('click')
        expect(viewsActions.toggleSelection).toBeCalledWith(fromJS([ticketFixtures.ticket.id]), true)
    })

    it('check the select all checkbox when all items are selected', () => {
        const component = shallow(
            <Table
                {...minProps}
                store={configureStore({
                    ...minStore,
                    views: minStore.views.merge({
                        _internal: {
                            selectedItemsIds: [ticketFixtures.ticket.id],
                        }
                    })
                })}
            />
        ).dive()
        const selectAllButton = component.find('thead').find('td')
        expect(selectAllButton.find('input')).toBeChecked()
    })
})
