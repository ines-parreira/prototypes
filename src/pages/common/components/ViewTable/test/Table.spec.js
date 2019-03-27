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
    const _identity = require('lodash/identity')

    return {
        fetchPage: jest.fn(() => _identity),
        toggleSelection: jest.fn(() => _identity),
        resetView: jest.fn(() => _identity),
    }
})

describe('ViewTable::Table', () => {
    const minStore = {
        views: fromJS({
            active: viewsFixtures.view,
        })
    }

    const viewConfig = viewsConfig.views.first()

    const minProps = {
        view: fromJS({}),
        type: viewConfig.get('name'),
        fields: viewConfig.get('fields').take(3),
        config: viewsConfig.getConfigByName('ticket'),
        items: fromJS([ticketFixtures.ticket]),
        isSearch: false,
        store: configureStore(minStore),
        isLoading: () => false,
        pagination: fromJS({}),
        onPageChange: () => {},
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('empty view', () => {
        const component = shallow(
            <Table
                {...minProps}
                fields={fromJS([])}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('default view', () => {
        const component = shallow(<Table {...minProps} />).dive()
        expect(component).toMatchSnapshot()
    })

    it('default view not selectable', () => {
        const component = shallow(
            <Table
                {...minProps}
                selectable={false}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('default view with no items', () => {
        const component = shallow(
            <Table
                {...minProps}
                items={fromJS([])}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('modified view with no items', () => {
        const component = shallow(
            <Table
                {...minProps}
                items={fromJS([])}
                view={fromJS({dirty: true})}
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
                selectedItemsIds={fromJS([ticketFixtures.ticket.id])}
                store={configureStore({
                    ...minStore
                })}
            />
        ).dive()
        const selectAllButton = component.find('thead').find('td')
        expect(selectAllButton.find('input')).toBeChecked()
    })
})
