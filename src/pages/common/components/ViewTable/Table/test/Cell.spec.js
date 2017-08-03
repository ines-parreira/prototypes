import React from 'react'
import {shallow, mount} from 'enzyme'
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
        link: '/url',
        item: fromJS(ticketFixtures.ticket),
        field: viewConfig.get('fields').first(),
        store: configureStore(),
    }

    it('should use default props', () => {
        const props = _omit(minProps, ['item'])
        const component = mount(<Cell {...props} />)
        expect(component.find('Cell').props()).toMatchSnapshot()
    })

    it('default cell', () => {
        const component = shallow(<Cell {...minProps} />).dive()
        expect(component).toMatchSnapshot()
    })
})
