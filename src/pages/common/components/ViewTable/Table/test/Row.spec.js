import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import configureStore from '../../../../../../store/configureStore'
import * as viewsConfig from '../../../../../../config/views'
import * as ticketFixtures from '../../../../../../fixtures/ticket'
import * as usersFixtures from '../../../../../../fixtures/users'
import * as viewsActions from '../../../../../../state/views/actions'
import Row from '../Row'

jest.mock('../../../../../../state/views/actions', () => {
    const _noop = require('lodash/noop')

    return {
        toggleSelection: jest.fn(() => _noop),
    }
})

describe('ViewTable::Table::Row', () => {
    const viewConfig = viewsConfig.views.first()

    const minProps = {
        type: viewConfig.get('name'),
        fields: viewConfig.get('fields').take(3),
        item: fromJS(ticketFixtures.ticket),
        isSelected: false,
        store: configureStore(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('default row', () => {
        let component
        beforeEach(() => {
            component = shallow(<Row {...minProps} />).dive()
        })

        it('displays', () => {
            expect(component).toMatchSnapshot()
        })

        it('toggle delete confirmation', () => {
            component.instance()._toggleSelection()
            expect(viewsActions.toggleSelection).toBeCalled()
        })
    })

    it('display agents viewing', () => {
        const component = shallow(
            <Row
                {...minProps}
                store={configureStore({
                    users: fromJS({
                        agents: usersFixtures.agents,
                        agentsLocation: usersFixtures.agentsLocation,
                    })
                })}
                item={fromJS(ticketFixtures.ticket).set('id', 1)}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })
})
