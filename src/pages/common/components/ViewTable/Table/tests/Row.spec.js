import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import configureStore from '../../../../../../store/configureStore'
import * as viewsConfig from '../../../../../../config/views.tsx'
import * as ticketFixtures from '../../../../../../fixtures/ticket.ts'
import * as agentsFixtures from '../../../../../../fixtures/agents.ts'
import * as viewsActions from '../../../../../../state/views/actions.ts'
import Row from '../Row'

jest.mock('../../../../../../state/views/actions.ts', () => {
    const _identity = require('lodash/identity')

    return {
        toggleIdInSelectedItemsIds: jest.fn(() => _identity),
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
            expect(viewsActions.toggleIdInSelectedItemsIds).toBeCalled()
        })
    })

    it('display agents viewing', () => {
        const component = shallow(
            <Row
                {...minProps}
                store={configureStore({
                    agents: fromJS({
                        all: agentsFixtures.agents,
                        locations: agentsFixtures.locations,
                    }),
                })}
                item={fromJS(ticketFixtures.ticket).set('id', 1)}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })
})
