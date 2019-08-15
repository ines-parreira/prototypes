import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import _omit from 'lodash/omit'

import configureStore from '../../../../../../store/configureStore'
import * as viewsConfig from '../../../../../../config/views'
import * as ticketFixtures from '../../../../../../fixtures/ticket'
import Cell from '../Cell'

describe('ViewTable::Table::Cell', () => {
    const viewConfig = viewsConfig.views.first()

    const minProps = {
        type: viewConfig.get('name'),
        item: fromJS(ticketFixtures.ticket),
        field: viewConfig.get('fields').first(),
        store: configureStore(),
    }

    it('should use default props', () => {
        const props = _omit(minProps, ['item'])
        const component = shallow(<Cell {...props} />)
        expect(component.find('Cell').props()).toMatchSnapshot()
    })

    it('default cell with no click handler passed (cant open items)', () => {
        const component = shallow(<Cell {...minProps} />).dive()
        expect(component).toMatchSnapshot()
    })

    it('default cell with a url passed', () => {
        const component = shallow(
            <Cell
                {...minProps}
                itemUrl="/app/ticket/123"
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('default cell with a click handler passed', () => {
        const component = shallow(
            <Cell
                {...minProps}
                onClick={() => {
                }}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })
})
